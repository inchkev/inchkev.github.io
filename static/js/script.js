$( "[data-project]" ).hover(
  function() {
    const project = $( this ).data( "project" );
    let work_el = $( "#work" ).find( "[data-project='" + project + "']" ).first();
    if (this !== work_el[0]) {
      let a = work_el.find( "a" );
      a.css("background-color", a.css("color"));
      work_el.find( "a > *").css("color", "white");
    }
    $( "#image-grid" ).find( "[data-project='" + project + "']" ).addClass("selected");
  },
  function() {
    const project = $( this ).data( "project" );
    let work_el = $( "#work" ).find( "[data-project='" + project + "']" ).first();
    if (this !== work_el[0]) {
      let a = work_el.find( "a" );
      work_el.find( "a > *").css("color", "");
      a.css("background-color", "");
    }
    $( "#image-grid" ).find( "[data-project='" + project + "']" ).removeClass("selected");
  }
);
