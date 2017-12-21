$(document).ready(function(){
    $.ajax('http://localhost:5000/query/v1/benchmarks?columns=id%2C%20elevation%2Cnorthsouth%2Csurveydate',{
        type: 'GET',  // http method
        dataType: 'json',      
        success: function (data, status, xhr) {
            console.log("Got the Data");
            var datatable= $('#table').DataTable({
                data:data,
                "columns": [
                    {
                        "data": "id"
                    },
                    {
                        "data": "elevation"
                    },
                    {
                        "data": "northsouth"
                    },
                    {
                        "data": "surveydate",
                        "render": function (jsondate) {
                            var date = new Date(jsondate);
                            var month = date.getMonth() + 1;
                            var year = date.getFullYear();
                            return month + "/" + year;
                        }
                    }
                ],         
                select: true,
                initComplete: function () {
                    this.api().columns().every( function () {
                        var column = this;
                        var select = $('<select><option value=""></option></select>')
                            .appendTo( $(column.footer()).empty() )
                            .on( 'change', function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );
        
                                column
                                    .search( val ? '^'+val+'$' : '', true, false )
                                    .draw();
                            } );
                            
                            column.data().unique().sort().each( function ( d, j ) {
                                select.append( '<option value="'+d+'">'+d+'</option>' )
                            });
                            column.each(function(){
                                console.log(column)
                                if(column[0]){
                                    column.data().unique().sort().each( function ( d, j ) {
                                            var date = new Date(d);
                                            var month = date.getMonth() + 1;
                                            var year = date.getFullYear();
                                        select.append( '<option value="'+year+'">'+year+'</option>' )
                                    } );
                                }
                            });
                    } );
                }
            });        
                 
            $('#elevation').on('change', function () {
                datatable.columns(1).search(this.value).draw();
            });
            $('#year').on('change', function () {
                datatable.columns(3).search(this.value).draw();
            });
        },
        error: function (jqXhr, textStatus, errorMessage) {
            console.log(errorMessage);
        }
    });// end AJAX
    


});