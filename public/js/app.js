(function() {

  var App = Ember.Application.create();
App.ApplicationAdapter = DS.ActiveModelAdapter.extend({

});

App.ApplicationSerializer = DS.ActiveModelSerializer.extend({

});

  App.Kitten = DS.Model.extend({
    name: DS.attr('string'),
    picture: DS.attr('string')
  });

  App.Router.map(function() {
    // put your routes here
  });

  App.IndexRoute = Ember.Route.extend({
    model: function() {
      return this.store.find("kitten")
    }
  });

  App.ApplicationView=Ember.View.extend({
    didInsertElement:function(){
      var exampleSocket = new WebSocket("ws://sockets");
    }
  })
})();
