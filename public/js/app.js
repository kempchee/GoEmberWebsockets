(function() {

  var App = Ember.Application.create();
App.ApplicationAdapter = DS.ActiveModelAdapter.extend({

});

App.ApplicationSerializer = DS.ActiveModelSerializer.extend({

});
var attr=DS.attr;
  App.Link = DS.Model.extend({
    url:attr(),
    postedDate:attr(),
    revisionDate:attr(),
    description:attr()
  //  link: DS.attr('string'),
  //  picture: DS.attr('string')
  });

  App.Router.map(function() {
    // put your routes here

  });



  App.IndexRoute = Ember.Route.extend({
    model: function() {
      return this.store.find("link")
    },
    actions:{
      loadUpdates:function(){
        alert("update")
      }
    }
  });

  App.ApplicationView=Ember.View.extend({
    didInsertElement:function(){

    }
  })
})();
