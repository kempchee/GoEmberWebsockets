package main

    import (
      "net/http"
      "encoding/json"
      "fmt"
      //"gopkg.in/mgo.v2"
      //"gopkg.in/mgo.v2/bson"
    )




func getLinksHandler(w http.ResponseWriter, r *http.Request) {

  fmt.Println(formUpdatesCollection)
  var newLinks []Link
  var link Link
  for i:=0;i<len(formUpdatesCollection);i++{
    if formUpdates[i]==""{
      }else{
      newLinks=append(newLinks,Link{formUpdatesCollection[i].Url,formUpdatesCollection[i].Description,formUpdatesCollection[i].RevisionDate,formUpdatesCollection[i].PostedDate,i})
    }

  }
  structLinks:=Links{newLinks}
  jsonLinks,_:=json.Marshal(structLinks)
  w.Write([]byte(jsonLinks))
}
