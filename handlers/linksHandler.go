package main

import (
  "net/http"
  "io/ioutil"
  "github.com/moovweb/gokogiri"
  "github.com/moovweb/gokogiri/xpath"
  "encoding/json"
  "fmt"
  "net/url"
  //"gopkg.in/mgo.v2"
  //"gopkg.in/mgo.v2/bson"
)

func LinksHandler(w http.ResponseWriter, r *http.Request) {


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
  linkFinder:=xpath.Compile("//td/a/@href")
  descriptionFinder:=xpath.Compile("//td[2]/text()")
  revisionDateFinder:=xpath.Compile("//td[3]/text()")
  postedDateFinder:=xpath.Compile("//td[4]/text()")
  //fmt.Println(doc.Root().String())
  rows, _ := doc.Root().Search(rowsFinder)
  var links []string
  var descriptions []string
  var revisionDates []string
  var postedDates []string
  for i:=0;i<len(rows);i++{
    rowHtml,_:=gokogiri.ParseHtml([]byte(rows[i].String()))

    link,_:=rowHtml.Search(linkFinder)
    description,_:=rowHtml.Search(descriptionFinder)
    revisionDate,_:=rowHtml.Search(revisionDateFinder)
    postedDate,_:=rowHtml.Search(postedDateFinder)
    if len(link)>0{
      url,_:=url.Parse(link[0].String())
      links=append(links,"http://www.irs.gov/"+url.Path)
    }else{
      links=append(links,"")
    }
    if len(descriptions)>0{
      descriptions=append(descriptions,description[0].String())
    }else{
      descriptions=append(descriptions,"")
    }
    if len(revisionDates)>0{
      revisionDates=append(revisionDates,revisionDate[0].String())
    }else{
      revisionDates=append(revisionDates,"")
    }
    if len(postedDates)>0{
      postedDates=append(postedDates,postedDate[0].String())
    }else{
      postedDates=append(postedDates,"")
    }
  }
  var newLinks []Link
  for i:=0;i<len(links);i++{
    if links[i]==""{
      }else{
      newLinks=append(newLinks,Link{links[i],descriptions[i],revisionDates[i],postedDates[i],i})
    }

  }
  structLinks:=Links{newLinks}
  jsonLinks,_:=json.Marshal(structLinks)
  fmt.Println(jsonLinks)
  w.Write([]byte(jsonLinks))
}
