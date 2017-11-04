console.log ("Inside Main!");

var selection = {};
selection.devices = [];

$(document).ready(function () {

  $("#search").click (function () {
    $("[type='checkbox']:checked").each(function () {
      //console.log (this.parentNode.parentNode);
      var parent = this.parentNode.parentNode;
      // console.log (parseInt($("select", parent).val().replace(/\D/g, '')));
      var device = {};

      device.name = this.className;
      device.duration = parseInt($("select", parent).val().replace(/\D/g, ''));

      selection.devices.push(device);
      // console.log (this.className);
    });

    console.log (selection);


    /* $.ajax({
      url: "http://localhost:3000/api/search/",
      beforeSend: function( xhr ) {
        xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
      }
    })
      .done(function( data ) {
        if ( console && console.log ) {
          console.log( "Sample of data:", data.slice( 0, 100 ) );
        }
      });
    }); */

    $.post( "http://localhost:3000/api/search/", selection)
      .done(function( data ) {
        console.log( "Data Loaded: ", data );
      });
  });
});
