package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	// Endpoint de salud para Docker
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"middleware": "hello world",
		})
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "healthy",
		})
	})

	// ... el resto de tus rutas y lógica (proxy a la API, Redis, etc.) ...

	log.Println("Middleware Bolo Up!")
	app.Listen(":8080")
}
