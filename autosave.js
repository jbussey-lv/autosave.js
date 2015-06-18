(function ( $ ) {

    var saving_color    = 'yellow';
    var bad_color       = 'red'
    var time_limit      = 250;

    $.fn.autosave = function() {

        var action      = $(this).attr('action');
        var method      = $(this).attr('method');
        var base_data   = {};
        var $inputs     = $(this).find(':input');

        // set base data of all hidden fields   
        $inputs.filter('[type=hidden]').each(function(){
            base_data[$(this).attr('name')] = $(this).val();
        });

        // set known good states
        $inputs.each(function(){
            $(this).data('last_good', $(this).val());
            $(this).data('original_background_color', $(this).css('background-color'));
            $(this).data('save_call', null);
            $(this).data('save_request', null);
        });


        $inputs.on('keyup keydown', queueSave);
        $inputs.on('blur change', function(){save($(this))});

        function queueSave(){

            clearSaveQueue($(this))

            // if we're back to where we started... abort
            if($(this).val() == $(this).data('last_good')){
                markGood($(this));
                return
            }


            $that = $(this);

            $(this).data('save_call', setTimeout(function(){save($that);}, time_limit));

        }

        function getData($input){
            var data = {};

            $.each(base_data, function(key, val){
                data[key] = val;
            });

            data[$input.attr('name')] = $input.val();

            return data;
        }

        function clearSaveQueue($input){

            var save_request;

            clearTimeout($input.data('save_call'));
            if(save_request = $input.data('save_request')){
                save_request.abort();
            }

        }


        function save($input){

            markSaving($input);

            clearSaveQueue($input)

            var data = getData($input);

            var save_request = jQuery.ajax(action, {
                data: data,
                method: method,
                success: function(a,b,c){success($input, b);},
                error: function(a,b,c){if(b!='abort'){markBad($input);}}
            });

            $input.data('save_request', save_request);
        }

        function success($input, response){

            if(response == 'success'){
                markGood($input);
                $input.data('last_good', $input.val());
            }

        }

    };



    function markSaving($input){
        $input.css('background-color', saving_color);

    }

    function markGood($input){
        $input.css('background-color', $input.data('original_background_color'));
    }

    function markBad($input){
        $input.css('background-color', bad_color);
    }

 
}( jQuery ));