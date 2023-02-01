$( "[data-project]" ).hover(
  function() {
    const project = $( this ).data( "project" );
    let projects_el = $( "#projects" ).find( "[data-project='" + project + "']" ).first();
    if (this !== projects_el[0]) {
      let a = projects_el.find( "a" );
      a.css("background-color", a.css("color"));
      projects_el.find( "a > *").css("color", "white");
    }
    $( "#image-grid" ).find( "[data-project='" + project + "']" ).addClass("selected");
  },

  function() {
    const project = $( this ).data( "project" );
    let projects_el = $( "#projects" ).find( "[data-project='" + project + "']" ).first();
    if (this !== projects_el[0]) {
      let a = projects_el.find( "a" );
      projects_el.find( "a > *").css("color", "");
      a.css("background-color", "");
    }
    $( "#image-grid" ).find( "[data-project='" + project + "']" ).removeClass("selected");
  }
);
