package model

import (
	"errors"
)

type Game struct {
	ID         int    `json:"id"`
	GameNumber string `json:"game_number"`
	White      string `json:"white"`
	Black      string `json:"black"`
	TimeWhite  string `json:"time_white"`
	TimeBlack  string `json:"time_black"`
	Board      string `json:"board"`
	Result     string `json:"result"`
}

func QueryGames() ([]Game, error) {
	db := connect()

	var games []Game
	results, err := db.Query("SELECT id, game_number, white, black, time_white, time_black, board, result FROM games WHERE id IN (SELECT max(id) FROM games GROUP BY game_number) ORDER BY game_number DESC LIMIT 4")
	for results.Next() {
		var game Game
		// for each row, scan the result into our tag composite object
		err = results.Scan(
			&game.ID,
			&game.GameNumber,
			&game.White,
			&game.Black,
			&game.TimeWhite,
			&game.TimeBlack,
			&game.Board,
			&game.Result,
		)
		if err != nil {
			return nil, errors.New("ERROR DURING ROWS GATHERING")
		}

		games = append(games, game)
	}
	results.Close()
	db.Close()

	return games, nil
}

func QueryBoard(gameId string) (string, error) {
	db := connect()

	var board string
	err := db.QueryRow("SELECT board FROM games WHERE game_number = ? ORDER BY id DESC LIMIT 1", gameId).Scan(&board)
	if err != nil {
		return board, errors.New(err.Error())
	}
	db.Close()

	return board, nil
}

func AddGame(game Game) error {
	db := connect()
	_, err := db.Exec("INSERT INTO games VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)", game.GameNumber, game.White, game.Black, game.TimeWhite, game.TimeBlack, game.Board, game.Result)
	db.Close()

	return err
}
