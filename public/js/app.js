(function() {

  var App = Ember.Application.create();
App.ApplicationAdapter = DS.ActiveModelAdapter.extend({

});

App.ApplicationSerializer = DS.ActiveModelSerializer.extend({

});
var attr=DS.attr;
  App.Link = DS.Model.extend({
    url:attr()
  //  link: DS.attr('string'),
  //  picture: DS.attr('string')
  });

  App.Router.map(function() {
    // put your routes here
  });

  App.IndexRoute = Ember.Route.extend({
    model: function() {
      //var array;
    //  return $.ajax({
      //  url:"/links",
      //  method:"GET",
        //success:function(data){
        //  console.log(data.links)
        //  return data
        //}
      //})
      return this.store.find("link")
    }
  });

  App.ApplicationView=Ember.View.extend({
    didInsertElement:function(){
      var exampleSocket = new WebSocket("ws://sockets");
    }
  })
})();
