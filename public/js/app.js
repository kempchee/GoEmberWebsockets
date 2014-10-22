

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

  App.Router.map(function() {
    this.route("updatedFormsReport")
    this.route("allForms",{path:"/"})
    this.route("draftForms")

  });

  App.UpdatedFormsReportRoute=Ember.Route.extend({
    model:function(){
      return this.store.find("formReportItem",{year:2014,group:"1065"})
    }
  })

  App.UpdatedFormsReportController=Ember.ArrayController.extend({
    formReportYear:2014,
    possibleReports:["1065","1120","1040","1120-S"],
    actions:{
      changeReportYear:function(){

      }
    },
    changeReportYear:function(){
      var controller=this;
      jQuery.ajax({
        url:"form_report_items?year=2014&group="+this.get("selectedReport"),
        method:"GET",
        success:function(data){
          controller.store.unloadAll("formReportItem")
          JSON.parse(data).form_report_items.forEach(function(formReportItem){
            var serializedFormReportItem=controller.store.serializerFor("formReportItem").normalize(App.FormReportItem,formReportItem)
            controller.store.update("formReportItem",serializedFormReportItem)
          })
          controller.set("model",controller.store.all("formReportItem"))
        },
        error:function(){

        }
      })
    }.observes("selectedReport")
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
            console.log(data)
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

  App.DraftFormsView=Ember.View.extend({
    didInsertElement:function(){
    }
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


  App.DraftFormsRoute = Ember.Route.extend({
    model: function() {
      return this.store.find("draftForm")
    },
    actions:{
      loadUpdates:function(){
        var route=this;
        jQuery.ajax({
          url:"/update_draft_finks",
          method:"POST",
          success:function(data){
            console.log(data)
            data.links.forEach(function(draftForm){
              var serializedDraftForm=route.store.serializerFor("DraftForm").normalize(App.DraftForm,draftForm)
              route.store.update("DraftForm",serializedDraftForm)
            })
          },
          error:function(){

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
            console.log(data)
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
