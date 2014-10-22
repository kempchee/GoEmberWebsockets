

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
    description:attr()
  //  link: DS.attr('string'),
  //  picture: DS.attr('string')
  });

  App.FormReportItem = DS.Model.extend({
    url:attr(),
    name:attr(),
    postedDate:attr(),
    revisionDate:attr(),
    description:attr(),
    current:function(){

    }.property("revisionDate","year"),
    year:attr()
  //  link: DS.attr('string'),
  //  picture: DS.attr('string')
  });

  App.Router.map(function() {
    this.route("updatedFormsReport")
    this.route("allForms",{path:"/"})

  });

  App.UpdatedFormsReportRoute=Ember.Route.extend({
    model:function(){
      return this.store.find("formReportItem",{year:2014})
    }
  })

  App.UpdatedFormsReportController=Ember.ArrayController.extend({

  })

  App.AllFormsController=Ember.ArrayController.extend({
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

  App.AllFormsRoute = Ember.Route.extend({
    model: function() {
      return this.store.find("link")
    },
    actions:{
      loadUpdates:function(){
        var route=this;
        jQuery.ajax({
          url:"/updateLinks",
          method:"POST",
          success:function(data){
            data.links.forEach(function(link){
              var serializedLink=route.store.serializerFor("Link").normalize(App.Link,link)
              route.store.update("Link",serializedLink)
            })
          },
          error:function(){

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

  App.ApplicationView=Ember.View.extend({
    didInsertElement:function(){
    }
  })
