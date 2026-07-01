package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/proxy"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// ---------- Configuración desde entorno ----------
var (
	API_URL    = getEnv("API_URL", "http://api:3000")
	REDIS_ADDR = getEnv("REDIS_ADDR", "redis:6379")
	DB_HOST    = getEnv("DB_HOST", "postgres")
	DB_PORT    = getEnv("DB_PORT", "5432")
	DB_USER    = getEnv("DB_USER", "bolo_admin")
	DB_NAME    = getEnv("DB_NAME", "bolo")
	PORT       = getEnv("PORT", "8080")

	// Se leen desde archivos de secretos si existen, o de variables de entorno
	REDIS_PASSWORD = readSecret("REDIS_PASSWORD", "REDIS_PASSWORD_FILE")
	DB_PASSWORD    = readSecret("DB_PASSWORD", "DB_PASSWORD_FILE")

	SESSION_CACHE_TTL = 24 * time.Hour // TTL de la clave en Redis
)

// Conexiones globales
var (
	pgPool *pgxpool.Pool
	rdb    *redis.Client
)

// ---------- Helpers ----------
func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

// readSecret devuelve el contenido del archivo si la variable *_FILE existe,
// de lo contrario devuelve la variable de entorno directa.
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

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// ---------- Estructura de claims personalizados ----------
type CustomClaims struct {
	jwt.RegisteredClaims
	UserID    string `json:"sub"`
	Role      string `json:"role"`
	SessionID string `json:"sessionId"`
}

// ---------- Funciones de validación de JWT ----------

// validateJWT verifica el token usando la clave de sesión (con caché Redis).
func validateJWT(tokenStr string) (*CustomClaims, error) {
	// 1. Decodificar sin verificar para obtener sessionId
	parser := jwt.NewParser()
	unverifiedToken, _, err := parser.ParseUnverified(tokenStr, &CustomClaims{})
	if err != nil {
		return nil, fmt.Errorf("token inválido")
	}
	claims, ok := unverifiedToken.Claims.(*CustomClaims)
	if !ok || claims.SessionID == "" {
		return nil, fmt.Errorf("token sin sessionId")
	}

	// 2. Obtener jwtKey de la sesión (Redis + fallback PostgreSQL)
	jwtKey, err := getSessionKey(claims.SessionID)
	if err != nil {
		return nil, fmt.Errorf("sesión no encontrada o inactiva")
	}

	// 3. Verificar firma y expiración con la clave obtenida
	verifiedToken, err := jwt.ParseWithClaims(tokenStr, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})
	if err != nil {
		return nil, fmt.Errorf("token inválido: %v", err)
	}

	if finalClaims, ok := verifiedToken.Claims.(*CustomClaims); ok && verifiedToken.Valid {
		return finalClaims, nil
	}
	return nil, fmt.Errorf("token no válido")
}

// getSessionKey obtiene la jwtKey de la sesión. Primero busca en Redis,
// y si no está, consulta PostgreSQL y guarda en Redis.
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

// ---------- Punto de entrada ----------

func main() {
	// Inicializar conexiones
	pgPool = initPostgreSQL()
	defer pgPool.Close()

	rdb = initRedis()
	defer rdb.Close()

	// Configurar Fiber
	app := fiber.New(fiber.Config{
		AppName: "Bolo Gateway",
	})

	// Logger global de peticiones
	app.Use(logger.New(logger.Config{
		TimeZone:   "UTC",
		TimeFormat: "2006-01-02T15:04:05Z",
	}))

	// Healthcheck propio
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "gateway"})
	})

	// Rutas públicas que no requieren JWT
	publicPaths := []string{
		"/api/auth/passenger/login",
		"/api/auth/passenger/register",
		"/api/auth/admin/login",
		"/api/health", // healthcheck de la API
	}

	// Middleware de JWT para todas las rutas bajo /api excepto las públicas
	app.Use("/api/*", func(c *fiber.Ctx) error {
		path := c.Path()
		if contains(publicPaths, path) {
			return c.Next()
		}

		// Extraer token del header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Token no proporcionado",
			})
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		// Validar JWT
		claims, err := validateJWT(tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": err.Error(),
			})
		}

		// Inyectar headers con información del usuario
		c.Request().Header.Set("X-User-Id", claims.UserID)
		c.Request().Header.Set("X-User-Role", claims.Role)
		c.Request().Header.Set("X-Session-Id", claims.SessionID)

		return c.Next()
	})

	// Proxy inverso: reenviar todas las peticiones bajo /api a la API NestJS
	// Proxy inverso: reenviar todas las peticiones bajo /api a la API NestJS
	app.All("/api/*", func(c *fiber.Ctx) error {
		targetPath := strings.TrimPrefix(c.OriginalURL(), "/api")
		if targetPath == "" {
			targetPath = "/"
		}
		targetURL := API_URL + targetPath
		return proxy.Do(c, targetURL)
	})

	// Iniciar servidor
	log.Printf("Middleware iniciado en puerto %s", PORT)
	log.Fatal(app.Listen(":" + PORT))
}
