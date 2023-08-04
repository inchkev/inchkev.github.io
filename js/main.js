/* Kevin Chen */

$( "[data-project]" ).hover(
  function() {
    const project = $( this ).data( "project" );
    $( "#projects" ).find( "[data-project='" + project + "']" ).addClass("selected");
    $( "#image-grid" ).find( "[data-project='" + project + "']" ).addClass("selected");
  },

  function() {
    const project = $( this ).data( "project" );
    $( "#projects" ).find( "[data-project='" + project + "']" ).removeClass("selected");
    $( "#image-grid" ).find( "[data-project='" + project + "']" ).removeClass("selected");
  }
);


const buttonNames = ["design", "programming"];

$( "button" ).on("click", function(event) {
  const numSelected = $( "button.selected" ).length;
  const element = $( this );
  const buttonName = element.attr("name");

  if (numSelected == 1 && element.hasClass("selected")) {
    console.log("hi");
    element.removeClass("selected");
    $( "#projects, #image-grid" ).find("*").css({ "opacity": "", "filter": "" });
    return;
  }

  element.addClass("selected");

  for (const name of buttonNames) {
    if (name === buttonName) {
      $( "#projects, #image-grid" ).find(`.color-${name}`).css({ "opacity": "", "filter": "" });
    } else {
      $( "button[name='" + name + "']" ).removeClass("selected");
      $( "#projects" ).find(`.color-${name}`).css({ "opacity": "0.25", "filter": "blur(2px)" });
      $( "#image-grid" ).find(`.color-${name}`).css({ "opacity": "0.1", "filter": "blur(4px)" });
    }
  }
});

