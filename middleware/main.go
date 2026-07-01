package main

import (
	"context"
	"crypto/rand"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/go-redis/redis_rate/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/proxy"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// ═══════════════════════════════════════════════════════════════
// BOLO API Gateway (Go Fiber)
// ═══════════════════════════════════════════════════════════════
//
// Proxy inverso con validación de JWT (claves rotativas por sesión),
// caché Redis + fallback PostgreSQL, y ofuscación de infraestructura.
//
// Versión: 1.0.0 — Julio 2026
// ═══════════════════════════════════════════════════════════════

// ---------- Configuración desde entorno ----------
var (
	API_URL    = getEnv("API_URL", "http://api:3000")
	REDIS_ADDR = getEnv("REDIS_ADDR", "redis:6379")
	DB_HOST    = getEnv("DB_HOST", "postgres")
	DB_PORT    = getEnv("DB_PORT", "5432")
	DB_USER    = getEnv("DB_USER", "bolo_admin")
	DB_NAME    = getEnv("DB_NAME", "bolo")
	PORT       = getEnv("PORT", "8080")

	// Contraseñas: se leen de archivos de secretos si existen, o de variables de entorno
	REDIS_PASSWORD = readSecret("REDIS_PASSWORD", "REDIS_PASSWORD_FILE")
	DB_PASSWORD    = readSecret("DB_PASSWORD", "DB_PASSWORD_FILE")

	// Tiempo de vida de la caché de sesiones en Redis
	SESSION_CACHE_TTL = 24 * time.Hour
)

// Conexiones globales
var (
	pgPool *pgxpool.Pool // Pool de conexiones PostgreSQL
	rdb    *redis.Client // Cliente Redis
)

// ---------- Helpers ----------

// getEnv retorna el valor de una variable de entorno o un valor por defecto.
func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

// readSecret lee un secreto desde un archivo (si la variable *_FILE existe)
// o desde una variable de entorno directamente.
func readSecret(envVar, fileVar string) string {
	if filePath := os.Getenv(fileVar); filePath != "" {
		data, err := os.ReadFile(filePath)
		if err == nil {
			return strings.TrimSpace(string(data))
		}
		log.Printf("Advertencia: no se pudo leer el archivo secreto %s: %v", filePath, err)
	}
	return os.Getenv(envVar)
}

// contains verifica si un string está en un slice (rutas públicas).
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// generateUUID genera un UUID v4 básico (para el honeypot de Railway).
func generateUUID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "unknown"
	}
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

// ---------- Estructura de claims personalizados ----------
type CustomClaims struct {
	jwt.RegisteredClaims
	UserID        string `json:"sub"`
	Role          string `json:"role"`
	SessionID     string `json:"sessionId"`
	AssociationID string `json:"associationId"` // ← nuevo
}

// ---------- Validación de JWT ----------

// validateJWT decodifica el token, obtiene la clave de sesión (Redis/PostgreSQL)
// y verifica la firma. Devuelve los claims si es válido.
func validateJWT(tokenStr string) (CustomClaims, error) {
	// 1. Decodificar sin verificar para obtener el sessionId
	parser := jwt.NewParser()
	unverifiedToken, _, err := parser.ParseUnverified(tokenStr, &CustomClaims{})
	if err != nil {
		return CustomClaims{}, fmt.Errorf("token inválido")
	}
	claims, ok := unverifiedToken.Claims.(*CustomClaims)
	if !ok || claims.SessionID == "" {
		return CustomClaims{}, fmt.Errorf("token sin sessionId")
	}

	// 2. Obtener la clave de la sesión desde Redis (o PostgreSQL)
	jwtKey, err := getSessionKey(claims.SessionID)
	if err != nil {
		return CustomClaims{}, fmt.Errorf("sesión no encontrada o inactiva")
	}

	// 3. Verificar firma y expiración con la clave obtenida
	verifiedToken, err := jwt.ParseWithClaims(tokenStr, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})
	if err != nil {
		return CustomClaims{}, fmt.Errorf("token inválido: %v", err)
	}

	if finalClaims, ok := verifiedToken.Claims.(*CustomClaims); ok && verifiedToken.Valid {
		return *finalClaims, nil
	}
	return CustomClaims{}, fmt.Errorf("token no válido")
}

// getSessionKey obtiene la jwtKey de la sesión. Primero busca en Redis,
// y si no está, consulta PostgreSQL y la guarda en Redis.
func getSessionKey(sessionID string) (string, error) {
	ctx := context.Background()
	cacheKey := "session:" + sessionID

	// 1. Intentar Redis
	val, err := rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		return val, nil
	}

	// 2. Fallback a PostgreSQL
	var jwtKey string
	var isActive bool
	var expiresAt time.Time
	err = pgPool.QueryRow(ctx,
		`SELECT jwt_key, is_active, expires_at FROM auth.sessions WHERE id = $1`,
		sessionID,
	).Scan(&jwtKey, &isActive, &expiresAt)
	if err != nil || !isActive || expiresAt.Before(time.Now()) {
		return "", fmt.Errorf("sesión inválida")
	}

	// 3. Guardar en Redis para futuras peticiones
	rdb.Set(ctx, cacheKey, jwtKey, SESSION_CACHE_TTL)
	return jwtKey, nil
}

// ---------- Inicialización de servicios ----------

// initRedis crea el cliente Redis con reintentos.
func initRedis() *redis.Client {
	password := REDIS_PASSWORD
	log.Printf("Conectando a Redis en %s...", REDIS_ADDR)
	var client *redis.Client
	var err error
	for attempt := 1; attempt <= 5; attempt++ {
		client = redis.NewClient(&redis.Options{
			Addr:     REDIS_ADDR,
			Password: password,
			DB:       0,
		})
		_, err = client.Ping(context.Background()).Result()
		if err == nil {
			log.Println("Conexión a Redis exitosa")
			return client
		}
		log.Printf("Intento %d/5: error conectando a Redis: %v", attempt, err)
		time.Sleep(2 * time.Second)
	}
	log.Fatalf("No se pudo conectar a Redis tras 5 intentos: %v", err)
	return nil
}

// initPostgreSQL crea el pool de conexiones a PostgreSQL con reintentos.
func initPostgreSQL() *pgxpool.Pool {
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)
	log.Printf("Conectando a PostgreSQL en %s:%s...", DB_HOST, DB_PORT)

	var pool *pgxpool.Pool
	var err error
	for attempt := 1; attempt <= 5; attempt++ {
		pool, err = pgxpool.New(context.Background(), connStr)
		if err == nil {
			err = pool.Ping(context.Background())
			if err == nil {
				log.Println("Conexión a PostgreSQL exitosa")
				return pool
			}
		}
		log.Printf("Intento %d/5: error conectando a PostgreSQL: %v", attempt, err)
		time.Sleep(2 * time.Second)
	}
	log.Fatalf("No se pudo conectar a PostgreSQL tras 5 intentos: %v", err)
	return nil
}

func rateLimitMiddleware(rdb *redis.Client) fiber.Handler {
	limiter := redis_rate.NewLimiter(rdb)
	return func(c *fiber.Ctx) error {
		ctx := context.Background()
		res, err := limiter.Allow(ctx, c.IP(), redis_rate.PerMinute(5))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "Error interno"})
		}
		if res.Remaining < 0 {
			return c.Status(429).JSON(fiber.Map{"message": "Demasiadas peticiones"})
		}
		return c.Next()
	}
}

// ---------- Punto de entrada ----------
func main() {
	// Inicializar servicios externos
	pgPool = initPostgreSQL()
	defer pgPool.Close()

	rdb = initRedis()
	defer rdb.Close()

	// Configurar Fiber
	app := fiber.New(fiber.Config{
		AppName: "Bolo Gateway",
	})

	// ---- CORS con credenciales (necesario para cookies cross-origen) ----
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// ---- Honeypot: simular headers de Railway para confundir atacantes ----
	app.Use(func(c *fiber.Ctx) error {
		c.Set("server", "railway")
		c.Set("x-railway-request-id", generateUUID())
		c.Set("x-railway-service-name", "bolo-api")
		c.Set("x-railway-region", "us-west1")
		c.Set("railway-env", "production")
		return c.Next()
	})

	// ---- Logger de peticiones ----
	app.Use(logger.New(logger.Config{
		TimeZone:   "UTC",
		TimeFormat: "2006-01-02T15:04:05Z",
	}))

	// ---- Healthcheck propio ----
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "gateway"})
	})

	// ---- Rutas públicas (sin JWT) ----
	publicPaths := []string{
		"/api/auth/passenger/login",
		"/api/auth/passenger/register",
		"/api/auth/admin/login",
		"/api/health",
	}

	app.Use("/api/*", rateLimitMiddleware(rdb))

	// ---- Middleware de autenticación/autorización JWT ----
	app.Use("/api/*", func(c *fiber.Ctx) error {
		path := c.Path()
		if contains(publicPaths, path) {
			return c.Next()
		}

		// Obtener token: primero del header Authorization, luego de la cookie "token"
		tokenStr := ""
		authHeader := c.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}
		if tokenStr == "" {
			tokenStr = c.Cookies("token") // httpOnly cookie enviada por el backend
		}
		if tokenStr == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Token no proporcionado"})
		}

		// Validar el token con el sistema de claves rotativas
		claims, err := validateJWT(tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": err.Error()})
		}

		// Inyectar headers con información del usuario para la API
		c.Request().Header.Set("X-User-Id", claims.UserID)
		c.Request().Header.Set("X-User-Role", claims.Role)
		c.Request().Header.Set("X-Session-Id", claims.SessionID)

		// Reinyectar el token en el header Authorization para que la API NestJS lo reciba
		c.Request().Header.Set("Authorization", "Bearer "+tokenStr)

		return c.Next()
	})

	// ---- Proxy inverso hacia la API NestJS (sin el prefijo /api) ----
	app.All("/api/*", func(c *fiber.Ctx) error {
		targetPath := strings.TrimPrefix(c.OriginalURL(), "/api")
		if targetPath == "" {
			targetPath = "/"
		}
		targetURL := API_URL + targetPath
		return proxy.Do(c, targetURL)
	})

	// ---- Iniciar servidor ----
	log.Printf("Middleware iniciado en puerto %s", PORT)
	log.Fatal(app.Listen(":" + PORT))
}
