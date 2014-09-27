package main

import (
	"net/http"
	"log"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"io/ioutil"
	"github.com/moovweb/gokogiri"
	"github.com/moovweb/gokogiri/xpath"
	"encoding/json"
	"fmt"
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

func LinksHandler(w http.ResponseWriter, r *http.Request) {
	type Link struct{
		Url string `json:"url"`
		Id int `json:"id"`
	}
	type Links struct {
			Links []Link `json:"links"`
	}

	w.Header().Set("Content-Type", "application/json")
	resp,err := http.Get("http://apps.irs.gov/app/picklist/list/draftTaxForms.html")
	//resp,err := http.Get("http://www.irs.gov/pub/irs-dft/i8962--dft.pdf")
	if err!=nil{
		panic(err)
	}

	body, newError :=ioutil.ReadAll(resp.Body)
	if newError!=nil{
		panic(err)
	}
	// write whole the body
	err = ioutil.WriteFile("output.txt", body, 0644)
	if err != nil {
			panic(err)
	}

	doc, _ := gokogiri.ParseHtml([]byte(body))
	rowsFinder := xpath.Compile("//table[@class='picklist-dataTable']/tr")
	linkFinder:=xpath.Compile("//td/a")
	//fmt.Println(doc.Root().String())
	rows, _ := doc.Root().Search(rowsFinder)
	var links []string
	for i:=0;i<len(rows);i++{
		rowHtml,_:=gokogiri.ParseHtml([]byte(rows[i].String()))
		link,_:=rowHtml.Search(linkFinder)
		if len(link)>0{
			links=append(links,link[0].String())
		}
	}
	var newLinks []Link
	for i:=0;i<len(links);i++{

		newLinks=append(newLinks,Link{links[i],i})
	}
	structLinks:=Links{newLinks}
	jsonLinks,_:=json.Marshal(structLinks)
	fmt.Println(jsonLinks)
	w.Write([]byte(jsonLinks))
}

func main() {
	log.Println("Starting Server")

	r := mux.NewRouter()
	r.HandleFunc("/sockets",SocketsHandler)
	r.HandleFunc("/links", LinksHandler).Methods("GET")
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./public/")))
  http.Handle("/", r)

	log.Println("Listening on 8080")
	http.ListenAndServe(":8080", nil)
}
