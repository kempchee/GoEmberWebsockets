package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/moovweb/gokogiri"
	"github.com/moovweb/gokogiri/xpath"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	//"github.com/kempchee/GoEmber/handlers"
)

var (
	session               *mgo.Session
	formUpdatesCollection *mgo.Collection
)

type Link struct {
	Url          string        `bson:"Url" json:"url"`
	Name         string        `bson:"Name" json:"name"`
	Description  string        `bson:"Description" json:"description"`
	RevisionDate string        `bson:"RevisionDate" json:"revisionDate"`
	PostedDate   string        `bson:"PostedDate" json:"postedDate"`
	Id           bson.ObjectId `bson:"_id" json:"id"`
}
type Links struct {
	Links []Link `json:"links"`
}

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

func main() {
	log.Println("Starting Server")
	log.Println("Starting mongo db session")
	session, err := mgo.Dial("localhost")
	if err != nil {
		panic(err)
	}
	defer session.Close()
	// Optional. Switch the session to a monotonic behavior.
	session.SetMode(mgo.Monotonic, true)
	formUpdatesCollection = session.DB("irsForms").C("formUpdates")

	r := mux.NewRouter()
	r.HandleFunc("/sockets", SocketsHandler)
	r.HandleFunc("/links", getLinksHandler).Methods("GET")
	r.HandleFunc("/getLinks", getLinksHandler).Methods("GET")
	r.HandleFunc("/updateLinks", UpdateLinksHandler).Methods("POST")
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./public/")))
	http.Handle("/", r)

	log.Println("Listening on 8080")
	http.ListenAndServe(":8080", nil)
}

func doesUpdateExist(query bson.M) bool {
	var formUpdate Link
	error := formUpdatesCollection.Find(query).One(&formUpdate)
	if error != nil {
		return false
	} else {
		return true
	}
}

func getLinksHandler(w http.ResponseWriter, r *http.Request) {
	var formUpdates []Link
	formUpdatesCollection.Find(nil).All(&formUpdates)
	if len(formUpdates) > 0 {
		structLinks := Links{formUpdates}
		jsonLinks, _ := json.Marshal(structLinks)
		w.Write([]byte(jsonLinks))
	} else {
		w.Write([]byte(`{"links":[]}`))
	}

}

func UpdateLinksHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	resp, err := http.Get("http://apps.irs.gov/app/picklist/list/draftTaxForms.html")
	//resp,err := http.Get("http://www.irs.gov/pub/irs-dft/i8962--dft.pdf")
	if err != nil {
		panic(err)
	}

	body, newError := ioutil.ReadAll(resp.Body)
	if newError != nil {
		panic(err)
	}
	// write whole the body
	err = ioutil.WriteFile("output.txt", body, 0644)
	if err != nil {
		panic(err)
	}

	doc, _ := gokogiri.ParseHtml([]byte(body))
	rowsFinder := xpath.Compile("//table[@class='picklist-dataTable']/tr")
	nameFinder := xpath.Compile("//td/a/text()")
	linkFinder := xpath.Compile("//td/a/@href")
	descriptionFinder := xpath.Compile("//td[2]/text()")
	revisionDateFinder := xpath.Compile("//td[3]/text()")
	postedDateFinder := xpath.Compile("//td[4]/text()")
	//fmt.Println(doc.Root().String())
	rows, _ := doc.Root().Search(rowsFinder)
	var links []string
	var names []string
	var descriptions []string
	var revisionDates []string
	var postedDates []string
	for i := 0; i < len(rows); i++ {
		rowHtml, _ := gokogiri.ParseHtml([]byte(rows[i].String()))
		fmt.Println(rowHtml)
		link, _ := rowHtml.Search(linkFinder)
		name, _ := rowHtml.Search(nameFinder)
		description, _ := rowHtml.Search(descriptionFinder)
		revisionDate, _ := rowHtml.Search(revisionDateFinder)
		postedDate, _ := rowHtml.Search(postedDateFinder)
		if len(links) > 0 {
			url, _ := url.Parse(link[0].String())
			links = append(links, "http://www.irs.gov"+url.Path)
		} else {
			links = append(links, "")
		}
		if len(names) > 0 {
			names = append(names, name[0].String())
		} else {
			names = append(names, "")
		}
		if len(descriptions) > 0 {
			descriptions = append(descriptions, description[0].String())
		} else {
			descriptions = append(descriptions, "")
		}
		if len(revisionDates) > 0 {
			revisionDates = append(revisionDates, revisionDate[0].String())
		} else {
			revisionDates = append(revisionDates, "")
		}
		if len(postedDates) > 0 {
			postedDates = append(postedDates, postedDate[0].String())
		} else {
			postedDates = append(postedDates, "")
		}
	}
	var newLinks []Link
	for i := 0; i < len(links); i++ {
		if links[i] == "" {
		} else {
			newLinks = append(newLinks, Link{links[i], names[i], descriptions[i], revisionDates[i], postedDates[i], bson.NewObjectId()})
		}
	}
	for i := 0; i < len(newLinks); i++ {
		count, _ := formUpdatesCollection.Find(bson.M{"Name": newLinks[i].Name, "PostedDate": newLinks[i].PostedDate}).Count()
		fmt.Println(newLinks[i].Name)
		if count == 0 {
			fmt.Println(newLinks[i])
			formUpdatesCollection.Insert(&newLinks[i])
		} else {
		}
	}
	//structLinks := Links{newLinks}
//	jsonLinks, _ := json.Marshal(structLinks)
	var formUpdates []Link
	formUpdatesCollection.Find(nil).All(&formUpdates)
	structLinks := Links{formUpdates}
	jsonLinks, _ := json.Marshal(structLinks)
	w.Write([]byte(jsonLinks))
}
