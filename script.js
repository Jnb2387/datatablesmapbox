$(document).ready(function() {
    
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam5iMjM4NyIsImEiOiJjajcwcTgxeWMwY3RkMzFtcWU2d3BxbWFkIn0.LWlSNqnmsFKuSy2kUwJOVA';
  var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-105, 39.75], // starting position [lng, lat]
      zoom: 9 // starting zoom
  });


    var datatable;
  $.ajax(
      "http://localhost:5000/geojson/v1/benchmarks?geom_column=geom&columns=id%2Celevation%2Cnorthsouth%2Csurveydate&limit=5000",
    // "http://localhost:5000/query/v1/benchmarks?columns=id%2C%20elevation%2Cnorthsouth%2Csurveydate",
    {
      type: "GET", // http method
      dataType: "json",
      success: function(data, status, xhr) {
        console.log("Got the Data",data)
        var dataArr = [];
        $.each(data.features,function(index, property){
            console.log(JSON.stringify(property.properties));
            dataArr.push(property.properties)
        })
        datatable = $("#table").DataTable({
          // "processing": true,
          // "serverSide": true,
          // "cache":false,

          // "paging": true,
          // "draw":1,
          // "ajax": {
          //     // "url":"http://localhost:5000/query/v2/denverparks?columns=name%20as%20id%2C%20type%20as%20elevation%2C%20%20city%20as%20northsouth%2C%20%20county%20as%20surveydate",
          //     "url": "http://localhost:5000/query/v2/benchmarks?columns=id%2C%20elevation%2Cnorthsouth%2Csurveydate",
          //     "type": "POST",
          // "data": function ( args ) {
          //     return { "args": JSON.stringify( args ) };
          //   },
          data: dataArr,
          dataSrc: "",
          // },
          columns: [
            {
              data: "id"
            },
            {
              data: "elevation"
            },
            {
              data: "northsouth"
            },
            {
              data: "surveydate"
              // "render": function (jsondate) {
              //     var date = new Date(jsondate);
              //     var month = date.getMonth() + 1;
              //     var year = date.getFullYear();
              //     return month + "/" + year;
              // }
            }
          ],
          "select": true,
          autoWidth: false,
        //   sPaginationType: "full_numbers",
          scrollY: "50vh",
          scrollX: "100%",
        //   order:false,
        //   scrollCollapse: true,
          // "scrollCollapse": true,
          // "jQueryUI": true,
          search: { caseInsensitive: true },
          //  "iDisplayLength": 2,
          paging: true,
          info: true,
          lengthMenu: [10, 20, 50, 100],

          initComplete: function() {
            // Update footer

            this.api()
              .columns()
              .every(function() {
                var column = this;
                var operatorselect = $(
                  '<select name="operators" id="operators"><option value=></option><option value=">">></option><option value="=">=</option><option value="<="><=</option><option value=">=">>=</option></select>'
                )
                  .appendTo($(column.header()))
                  .on("change", function() {
                    console.log(this.value);
                    var operators = $(this).val();
                    datatable.search(this.value).draw("page");
                  });

                var select = $('<select><option value=""></option></select>')
                  .appendTo($(column.header()))
                  .on("change", function() {
                    console.log(column);
                    var val = $.fn.dataTable.util.escapeRegex($(this).val());

                    column.search(val, $("select")).draw("page");
                  });

                // datatable.ajax.reload( function() {
                column
                  .data()
                  .unique()
                  .sort()
                  .each(function(d, j) {
                    select.append(
                      '<option value="' + d + '">' + d + "</option>"
                    );
                  });
                // });
                $(this.header()).find('select').on('click',function(e){
                    console.log("e clicked");
                  e.stopPropagation();
                });
              });
          },
          
          drawCallback: function(row, data, start, end, display) {
            




              var api = this.api();
              
            var intVal = function(i) {
              return typeof i === "string"
                ? i.replace(/[\$,]/g, "") * 1
                : typeof i === "number" ? i : 0;
            };
            // var api = this.api(),
            total = api
              .column(1)
              .data()
              .reduce(function(a, b) {
                // console.log("a ", a + "\nb ", b);
                return intVal(a) + intVal(b);
              }, 0);

            // Total over this page
            pageTotal = api.column(1, { page: "current" }).every(function() {
              var sum = this.data().reduce(function(a, b) {
                return intVal(a) + intVal(b);
              }, 0);
              console.log("sum: ", sum);
              $(api.column(1).footer()).html(
                "" + sum + " (" + total + " total)"
              );
            });

            var ids = [];
            console.log("LIST OF ID's IN TABLE PAGE:", ids);
            api.column(0,{ page: "current" }).data().each(function(data){
                // console.log(data)
                // console.log(ids)
                ids.push(data)
            })
            $.ajax("http://localhost:5000/geojson/v1/benchmarks?geom_column=geom&columns=*&filter=id%20in%20("+ids+")&limit=5000",
            {
                type:'GET',
                dataType:'json',
                success:function(data, err){
                    if(map.getSource('point')){map.removeSource('point'); map.removeLayer('point')};
                    map.addSource('point', {
                        "type": "geojson",
                        "data": data
                    });
                
                    map.addLayer({
                        "id": "point",
                        "source": "point",
                        "type": "circle",
                        "paint": {
                            "circle-radius": 10,
                            "circle-color": "#007cbf"
                        }
                    });
           
                }
            
            });


          }
        });

        $("#elevation").on("change", function() {
          datatable
            .columns(0)
            .search(this.value)
            .draw();
        });
        $("#year").on("change", function() {
          datatable
            .columns(3)
            .search(this.value)
            .draw();
        });
      },
      error: function(jqXhr, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    }
  ); // end AJAX

  
  $('#table').on( 'click', 'tr', function () {
      if ( $(this).hasClass('selected') ) {
        console.log("Unselected")
        $(this).removeClass('selected');
    }
    else {
        console.log("Selected",datatable.row(this).data());
        var selectedrow = datatable.row(this).data().id
        console.log(datatable.row(this).data());
        // var coords = data.features[0].geometry.coordinates;
        
        // map.flyTo({
        //     center: coords,
        //     zoom: 13,
        //     speed: 10.2,
        //     curve: 1,
        //     easing(t) {
        //       return t;
        //     }
        //   });
      
        
        datatable.$('tr.selected').removeClass('selected');
 
        $(this).addClass('selected');
    }
} );




  // setInterval( function () {
  //     reload_table();
  // }, 5000 );

  // function reload_table() {
  //     datatable.ajax.reload(null,false);
  // }



  

map.on('load', function () {
    // var ids = [];
    // console.log("LIST OF ID's IN TABLE PAGE:", ids);
    // datatable.column(0,{ page: "current" }).data().each(function(data){
    //     console.log(data)
    //     console.log(ids)
    //     ids.push(data)
    // })
    // $.ajax("http://localhost:5000/geojson/v1/benchmarks?geom_column=geom&columns=*&filter=id%20in%20("+ids+")&limit=5000",
    // {
    //     type:'GET',
    //     dataType:'json',
    //     success:function(data, err){
    //         map.addSource('point', {
    //             "type": "geojson",
    //             "data": data
    //         });
        
    //         map.addLayer({
    //             "id": "point",
    //             "source": "point",
    //             "type": "circle",
    //             "paint": {
    //                 "circle-radius": 10,
    //                 "circle-color": "#007cbf"
    //             }
    //         });
    //         console.log(data);
    //         var coords = data.features[0].geometry.coordinates;
      
    //         map.flyTo({
    //             center: coords,
    //             zoom: 13,
    //             speed: 10.2,
    //             curve: 1,
    //             easing(t) {
    //               return t;
    //             }
    //           });
    //     }
    
    // });
    
    // Add a source and layer displaying a point which will be animated in a circle.
    
});


});// END READY


