package main

import (
	"bartender/model"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func setupRouter() *gin.Engine {
	r := gin.Default()
	r.LoadHTMLGlob("templates/**/*")
	r.StaticFile("/htmx.min.js", "./lib/htmx.min.js")
	r.StaticFile("/main.css", "./lib/main.css")
	r.StaticFile("/tt.png", "./images/tt.png")
	// r.StaticFile("/favicon.ico", "./images/favicon.ico")

	r.GET("/", func(c *gin.Context) {
		games, err := model.QueryGames()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}

		c.HTML(http.StatusOK, "index.tmpl", gin.H{"games": games})
	})

	r.GET("/json/games", func(c *gin.Context) {
		games, err := model.QueryGames()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}

		c.JSON(http.StatusCreated, games)
	})

	r.GET("/json/games/:id", func(c *gin.Context) {
		id := c.Param("id")
		board, err := model.QueryBoard(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}

		c.JSON(http.StatusCreated, board)
	})

	r.POST("/games", func(c *gin.Context) {
		var game model.Game
		if err := c.ShouldBind(&game); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := model.AddGame(game)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error})
		}

		c.JSON(http.StatusCreated, game)
	})

	return r
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers",
			"Content-Type, Content-Length, Authorization, Accept, Origin, X-Requested-With, Cache-Control",
		)
		c.Writer.Header().Set("Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS",
		)

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	fmt.Println("PLEASE REMEMBER TO IMPORT|RUN /model/migrations.sql BEFORE FRESH SETUP")

	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	if os.Getenv("APP_ENV") == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := setupRouter()
	if os.Getenv("APP_URL") != "127.0.0.1" {
		r.SetTrustedProxies([]string{os.Getenv("APP_URL")})
	}
	r.Use(CORSMiddleware())
	r.Run(":80")
}
