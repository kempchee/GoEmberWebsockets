package main

import (
	"net/http"
	"log"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

func SocketsHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    for {
	    messageType, p, err := conn.ReadMessage()
	    if err != nil {
	        return
	    }
	    if err = conn.WriteMessage(messageType, p); err != nil {
	        return
	    }
		}
}

func KittensHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"kittens": [
		{"id": 1, "name": "Bobby", "picture": "http://placekitten.com/300/200"},
		{"id": 2, "name": "Wally", "picture": "http://placekitten.com/300/200"},
		{"id": 3, "name": "Sammy", "picture": "http://placekitten.com/300/200"},
		{"id": 4, "name": "Dopey", "picture": "http://placekitten.com/300/200"}
	]}`))
}

func main() {
	log.Println("Starting Server")

	r := mux.NewRouter()
	r.HandleFunc("/sockets",SocketsHandler)
	r.HandleFunc("/kittens", KittensHandler).Methods("GET")
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./public/")))
  http.Handle("/", r)

	log.Println("Listening on 8080")
	http.ListenAndServe(":8080", nil)
}
