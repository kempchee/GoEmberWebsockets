package main

    import (
      "net/http"
      "encoding/json"
      "fmt"
      //"gopkg.in/mgo.v2"
      //"gopkg.in/mgo.v2/bson"
    )




func getLinksHandler(w http.ResponseWriter, r *http.Request) {
  var formUpdates []Link
  allUpdates:=formUpdatesCollection.Find(nil).All(&formUpdates)
  fmt.Println(allUpdates)
  var newLinks []Link
  var link Link
  //for i:=0;i<2;i++{
    //if formUpdates[i].Url==""{
    //  }else{
    //  newLinks=append(newLinks,Link{allUpdates[i].Url,allUpdates[i].Description,allUpdates[i].RevisionDate,allUpdates[i].PostedDate,i})
  //  }

//  }
  structLinks:=Links{newLinks}
  jsonLinks,_:=json.Marshal(structLinks)
  w.Write([]byte(jsonLinks))
}
