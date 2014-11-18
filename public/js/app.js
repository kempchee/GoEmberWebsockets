

var App = Ember.Application.create();
App.ApplicationAdapter = DS.ActiveModelAdapter.extend({

});

App.ApplicationSerializer = DS.ActiveModelSerializer.extend({

});
var attr=DS.attr;
  App.Link = DS.Model.extend({
    url:attr(),
    name:attr(),
    postedDate:attr(),
    revisionDate:attr(),
    description:attr(),
    annualUpdate:attr()
  //  link: DS.attr('string'),
  //  picture: DS.attr('string')
  });

  App.DraftForm = DS.Model.extend({
    url:attr(),
    name:attr(),
    postedDate:attr(),
    revisionDate:attr(),
    description:attr(),
    annualUpdate:attr(),
    deleted:attr(),
    superceded:attr()
  });

  App.FormReportItem = DS.Model.extend({
    url:attr(),
    name:attr(),
    postedDate:attr(),
    revisionDate:attr(),
    description:attr(),
    annualUpdate:attr(),
    current:function(){
      if(this.get("annualUpdate")==false&&this.get("revisionDate")!="N/A"){
        return true
      }else{
        if(this.get("revisionDate")==this.get("year")){
            return true
        }else{
            return false
        }
      }
    }.property("revisionDate","year"),
    year:attr()
  //  link: DS.attr('string'),
  //  picture: DS.attr('string')
  });

  App.DraftFormReportItem = DS.Model.extend({
    url:attr(),
    name:attr(),
    postedDate:attr(),
    revisionDate:attr(),
    description:attr(),
    annualUpdate:attr(),
    rowClass:function(){
      if(this.get("finalForm")){
        return "success"
      }
      else if(this.get("revisionDate")!="N/A"){
        return "warning"
      }else{
        return "danger"
      }
    }.property("revisionDate","year"),
    year:attr(),
    finalForm:attr()
  //  link: DS.attr('string'),
  //  picture: DS.attr('string')
  });

  App.Router.map(function() {

    this.resource("us",function(){
      this.route("updatedFormsReport")
      this.route("allForms")
      this.route("draftForms")
      this.route("draftFormsReport")

    })
    this.route("signIn")
    this.route("signUp")
    this.route("test")
    this.resource("states",function(){

    })


  });

App.AuthController=Ember.Controller.extend({

})

App.LoginRoute=Ember.Route.extend({
  actions:{
    login:function(){
      jQuery.ajax({
        url:"/login",
        data:{userName:this.controller.get("userName"),password:this.controller.get("password")},
        method:"POST",
        success:function(){

        },
        error:function(){

        }
      })
    }
  }
})

App.SignUpRoute=Ember.Route.extend({
  actions:{
    register:function(){
      jQuery.ajax({
        url:"/register",
        data:{userName:this.controller.get("userName"),password:this.controller.get("password")},
        method:"POST",
        success:function(){

        },
        error:function(){

        }
      })
    }
  }
})

  App.TestView=Ember.View.extend({
    didInsertElement:function(){
      var dataset = [
                  [ 5,     20 ],
                  [ 480,   90 ],
                  [ 250,   50 ],
                  [ 100,   33 ],
                  [ 330,   95 ],
                  [ 410,   12 ],
                  [ 475,   44 ],
                  [ 25,    67 ],
                  [ 85,    21 ],
                  [ 220,   88 ]
              ];
      var w = 500;
      var h = 200;
      var barPadding=1;
      var padding = 20;
      var xScale = d3.scale.linear()
                    .domain([0, d3.max(dataset, function(d) { return d[0]; })])
                    .range([padding, w-padding]);
     var yScale = d3.scale.linear()
                    .domain([0, d3.max(dataset, function(d) { return d[1]; })])
                    .range([h-padding,padding]);
    var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom");
      var svg = d3.select("#test")
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h)
      svg.selectAll("circle")  // <-- No longer "rect"
       .data(dataset)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
            return xScale(d[0]);
       })
       .attr("cy", function(d) {
            return yScale(d[1]);
       })
       .attr("r", 5);
      svg.append("g")
      .call(xAxis);


    }
  })

  App.StatesIndexView=Ember.View.extend({
    lastHoverTime:0,
    hoverView:null,
    didInsertElement:function(){
      var view=this;
      //$("#map").mouseover(function(event){
      //  view.get("hoverView").destroy()
      //})
    var sampleSVG = d3.select("#map")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 1000);

        var path = d3.geo.path();
        var color = d3.scale.quantize()
                    .range(["rgb(237,248,233)", "rgb(186,228,179)",
                     "rgb(116,196,118)", "rgb(49,163,84)","rgb(0,109,44)"]);
        d3.csv("csv/agriculture.csv", function(data) {
          color.domain([
            d3.min(data, function(d) { return d.value; }),
            d3.max(data, function(d) { return d.value; })
          ]);
          d3.json("json/states.json", function(json) {

        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
          for (var i = 0; i < data.length; i++) {

              //Grab state name
              var dataState = data[i].state;

              //Grab data value, and convert from string to float
              var dataValue = parseFloat(data[i].value);

              //Find the corresponding state inside the GeoJSON
              for (var j = 0; j < json.features.length; j++) {

              var jsonState = json.features[j].properties.name;

              if (dataState == jsonState) {

                  //Copy the data value into the JSON
                  json.features[j].properties.value = dataValue;

                  //Stop looking through the JSON
                  break;

                  }
              }
          }
          sampleSVG.selectAll("path")
             .data(json.features)
             .enter()
             .append("path")
             .attr("d", path)
             .attr("data-toggle","tooltip")
             .style("fill", function(d) {
                                //Get data value
                                var value = d.properties.value;

                                if (value) {
                                        //If value exists…
                                        return color(value);
                                } else {
                                        //If value is undefined…
                                        return "#ccc";
                                }
                              })
             .on("mouseover", function(d){

                 var cx = d3.mouse(this)[0];
                 var cy = d3.mouse(this)[1];
                 if(view.get("hoverView")){
                   view.get("hoverView").destroy()
                 }
                 view.set("hoverView",view.createChildView(App.RClickMenuComponent,{x:cx,y:cy,name:d.properties.name}))
                 view.get("hoverView").append()
                 view.set("lastHoverTime",new Date().getTime()/1000)


               d3.select(this).style("fill", "steelblue" );
               event.stopPropagation();
              })
             .on("mouseout", function(){d3.select(this).style("fill", function(d) {
                                //Get data value

                                  view.get("hoverView").destroy()

                                var value = d.properties.value;

                                if (value) {
                                        //If value exists…
                                        return color(value);
                                } else {
                                        //If value is undefined…
                                        return "#ccc";
                                }
                              });})
              .on("click",function(event){
                window.location.href="http://www.google.com"
              })

        })





    })
  }
})

App.RClickMenuComponent = Ember.Component.extend({
  didInsertElement:function(){
    var view=this;
    console.log(view.get("name"))
        console.log($("svg").position())
    var svgTop=$("svg").position().top
    var svgLeft=$("svg").position().left
    $(".rmenu").css("top",view.get("y")+svgTop);
    $(".rmenu").css("left",view.get("x")+svgLeft);
    var mousedownHandler=function(event){
      if(event.button==2){
        view.destroy()
        $("body").unbind("mousedown",mousedownHandler)
        $("body").unbind("click",clickHandler)
      }
    }
    var clickHandler=function(){
      view.destroy()
      $("body").unbind("click",clickHandler)
      $("body").unbind("mousedown",mousedownHandler)
    }
    $("body").on("mousedown",mousedownHandler)
    $("body").on("click",clickHandler)
  },
  layoutName:"rclick-menu"
})

  App.UsUpdatedFormsReportRoute=Ember.Route.extend({
    model:function(){
      return this.store.find("formReportItem",{year:2014,group:"1065"})
    }
  })

  App.UsDraftFormsReportRoute=Ember.Route.extend({
    model:function(){
      return this.store.find("draftFormReportItem",{year:2014,group:"1065"})
    }
  })

  App.UsDraftFormsReportController=Ember.ArrayController.extend({
    formReportYear:2014,
    possibleReports:["1065","1120","1040","1120-S"],
    actions:{
      changeReportYear:function(){

      }
    },
    changeReportYear:function(){
      var controller=this;
      jQuery.ajax({
        url:"draft_form_report_items?year=2014&group="+this.get("selectedReport"),
        method:"GET",
        success:function(data){
          controller.store.unloadAll("draftFormReportItem")
          JSON.parse(data).draft_form_report_items.forEach(function(draftFormReportItem){
            var serializedDraftFormReportItem=controller.store.serializerFor("draftFormReportItem").normalize(App.DraftFormReportItem,draftFormReportItem)
            controller.store.update("draftFormReportItem",serializedDraftFormReportItem)
          })
          controller.set("model",controller.store.all("draftFormReportItem"))
        },
        error:function(){

        }
      })
    }.observes("selectedReport")
  })

  App.UsAllFormsController=Ember.ArrayController.extend({
    formCount:function(){

      return this.get("content.content").length
    }.property("content.[]"),
    actions:{
      setFilterColumn:function(column){
  			this.set("filterColumn",column)
  		},
      setSortProperty:function(property){
        console.log(this.get("sortProperties"))
        if(this.get("sortProperties")[0].split(":")[0]==property){
          if(this.get("sortDirection")=="asc"){
            this.set("sortDirection","desc")
          }else{
            this.set("sortDirection","asc")
          }
        }
        this.set("sortProperties",[property+":"+this.get("sortDirection")])
      },
      changePage: function (index) {
        this.set("currentPage", index)
      },
      incrementPage:function(index){
        this.set("currentPage",Math.floor((index-1)/8)*8+9)
        Ember.run.once(this,"setVisibleList")
      },
      decrementPage:function(index){
        this.set("currentPage",Math.floor((index-1)/8)*8-7)
        Ember.run.once(this,"setVisibleList")
      }
    },
    displayFilterColumn:function(){
  		var string=this.get("filterColumn")
  		return (string.charAt(0).toUpperCase() + string.substring(1))
  	}.property("filterColumn"),
    sortDirection:"asc",
    sortProperties:["postedDate:asc"],
    sortedLinks:Ember.computed.sort("content","sortProperties"),
    filteredLinks:Ember.computed.filter("sortedLinks",function(link){
      console.log("hi")
      return String(link.get(this.get("filterColumn"))).match(this.get("filterValue"))
    }).property("sortedLinks","filterColumn","filterValue"),
    currentPage: 1,
	  perPage:10,
    filterColumn:"name",
	  filterValue:"",
    visibleList: function () {
      var links=[];
      var linkList=this.get("filteredLinks")
      console.log((this.get("currentPage")-1)*this.get("perPage"))
      console.log(((this.get("currentPage")-1)*this.get("perPage")+this.get("perPage")))
      for(var i=(this.get("currentPage")-1)*this.get("perPage");i<((this.get("currentPage")-1)*this.get("perPage")+this.get("perPage"));i++){
        if(linkList.length>i){
          links.push(linkList[i])
        }else{
          break
        }
      }
      return links
    }.property( "filteredLinks.[]", "currentPage","perPage"),
    paginationHash: function(){
				var controller = this;
				var length = this.get("filteredLinks").length
				if (length % this.get("perPage") === 0) {
						var ceiling = Math.floor(length / this.get("perPage"))
				} else {
						var ceiling = (Math.floor(length / this.get("perPage")) + 1)
				}
        var mapRange=[]
        for(var i=1;i<ceiling+1;i++){
          mapRange.push(i)
        }
				var pagination = mapRange.map(function(page) {
						if (page === controller.get("currentPage")) {
								return [page, true]
						} else {
								return [page, false]
						}
				})
				var currentPageGroupIndex=0
				var groupIndex=-1
				var groups=[]
				pagination.forEach(function(element,index){
					if(index%8==0){
						groups.push([])
						groupIndex+=1
					}
					if(element[1]==true){
						currentPageGroupIndex=groupIndex
					}
						groups[Math.floor(index/8)].push(element)
				})
				var paginationHash={}
				paginationHash["pages"]=groups[currentPageGroupIndex]
				if(currentPageGroupIndex>0){
					paginationHash["leftArrow"]=true
				}
				else{
					paginationHash["leftArrow"]=false
				}
				if(currentPageGroupIndex<groups.length-1){
					paginationHash["rightArrow"]=true
				}
				else{
					paginationHash["rightArrow"]=false
				}
        console.log(paginationHash)
				return paginationHash
	}.property("arrayLength", "perPage","currentPage","filteredLinks.[]"),
  })


  App.UsDraftFormsView=Ember.View.extend({
    didInsertElement:function(){
    }
  })

  App.UsDraftFormsController=Ember.ArrayController.extend({
    formCount:function(){

      return this.get("content.content").length
    }.property("content.[]"),
    actions:{
      setFilterColumn:function(column){
        this.set("filterColumn",column)
      },
      setSortProperty:function(property){
        console.log(this.get("sortProperties"))
        if(this.get("sortProperties")[0].split(":")[0]==property){
          if(this.get("sortDirection")=="asc"){
            this.set("sortDirection","desc")
          }else{
            this.set("sortDirection","asc")
          }
        }
        this.set("sortProperties",[property+":"+this.get("sortDirection")])
      },
      changePage: function (index) {
        this.set("currentPage", index)
      },
      incrementPage:function(index){
        this.set("currentPage",Math.floor((index-1)/8)*8+9)
        Ember.run.once(this,"setVisibleList")
      },
      decrementPage:function(index){
        this.set("currentPage",Math.floor((index-1)/8)*8-7)
        Ember.run.once(this,"setVisibleList")
      }
    },
    displayFilterColumn:function(){
      var string=this.get("filterColumn")
      return (string.charAt(0).toUpperCase() + string.substring(1))
    }.property("filterColumn"),
    sortDirection:"asc",
    sortProperties:["postedDate:asc"],
    sortedLinks:Ember.computed.sort("content","sortProperties"),
    filteredLinks:Ember.computed.filter("sortedLinks",function(link){
      console.log("hi")
      return String(link.get(this.get("filterColumn"))).match(this.get("filterValue"))
    }).property("sortedLinks","filterColumn","filterValue"),
    currentPage: 1,
    perPage:10,
    filterColumn:"name",
    filterValue:"",
    visibleList: function () {
      var links=[];
      var linkList=this.get("filteredLinks")
      console.log((this.get("currentPage")-1)*this.get("perPage"))
      console.log(((this.get("currentPage")-1)*this.get("perPage")+this.get("perPage")))
      for(var i=(this.get("currentPage")-1)*this.get("perPage");i<((this.get("currentPage")-1)*this.get("perPage")+this.get("perPage"));i++){
        if(linkList.length>i){
          links.push(linkList[i])
        }else{
          break
        }
      }
      return links
    }.property( "filteredLinks.[]", "currentPage","perPage"),
    paginationHash: function(){
        var controller = this;
        var length = this.get("filteredLinks").length
        if (length % this.get("perPage") === 0) {
            var ceiling = Math.floor(length / this.get("perPage"))
        } else {
            var ceiling = (Math.floor(length / this.get("perPage")) + 1)
        }
        var mapRange=[]
        for(var i=1;i<ceiling+1;i++){
          mapRange.push(i)
        }
        var pagination = mapRange.map(function(page) {
            if (page === controller.get("currentPage")) {
                return [page, true]
            } else {
                return [page, false]
            }
        })
        var currentPageGroupIndex=0
        var groupIndex=-1
        var groups=[]
        pagination.forEach(function(element,index){
          if(index%8==0){
            groups.push([])
            groupIndex+=1
          }
          if(element[1]==true){
            currentPageGroupIndex=groupIndex
          }
            groups[Math.floor(index/8)].push(element)
        })
        var paginationHash={}
        paginationHash["pages"]=groups[currentPageGroupIndex]
        if(currentPageGroupIndex>0){
          paginationHash["leftArrow"]=true
        }
        else{
          paginationHash["leftArrow"]=false
        }
        if(currentPageGroupIndex<groups.length-1){
          paginationHash["rightArrow"]=true
        }
        else{
          paginationHash["rightArrow"]=false
        }
        console.log(paginationHash)
        return paginationHash
  }.property("arrayLength", "perPage","currentPage","filteredLinks.[]"),
  })


  App.UsDraftFormsRoute = Ember.Route.extend({
    model: function() {
      return this.store.find("draftForm")
    },
    actions:{
      loadUpdates:function(){
        $(".fa-refresh").addClass("fa-spin")
        var route=this;
        jQuery.ajax({
          url:"/update_draft_forms",
          method:"POST",
          success:function(data){
            console.log(data)
            data.draft_forms.forEach(function(draftForm){
              var serializedDraftForm=route.store.serializerFor("DraftForm").normalize(App.DraftForm,draftForm)
              route.store.update("DraftForm",serializedDraftForm)
            })
            $(".fa-refresh").removeClass("fa-spin")
          },
          error:function(){
            $(".fa-refresh").removeClass("fa-spin")
          }
        })
      },
      deleteDraftForms:function(){
        var route=this;
        jQuery.ajax({
          url:"/delete_draft_forms",
          method:"POST",
          success:function(data){
            route.store.unloadAll("draftForm")
          },
          error:function(){

          }
        })
      }
    }
  });

  App.UsAllFormsRoute = Ember.Route.extend({
    model: function() {
      return this.store.find("link")
    },
    actions:{
      loadUpdates:function(){
        $(".fa-refresh").addClass("fa-spin")
        var route=this;
        jQuery.ajax({
          url:"/updateLinks",
          method:"POST",
          success:function(data){
            console.log(data)
            data.links.forEach(function(link){
              var serializedLink=route.store.serializerFor("Link").normalize(App.Link,link)
              route.store.update("Link",serializedLink)
            })
            $(".fa-refresh").removeClass("fa-spin")
          },
          error:function(){
            $(".fa-refresh").removeClass("fa-spin")
          }
        })
      },
      deleteLinks:function(){
        var route=this;
        jQuery.ajax({
          url:"/deleteLinks",
          method:"POST",
          success:function(data){
            route.store.unloadAll("link")
          },
          error:function(){

          }
        })
      }
    }
  });
