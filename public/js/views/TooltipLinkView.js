App.TooltipLinkView=Ember.View.extend({
  attributeBindings:["data-toggle","data-placement","title"],
  didInsertElement:function(){
    this.$().tooltip({container:"body"})
  },
  dataToggle:"tooltip"
})
