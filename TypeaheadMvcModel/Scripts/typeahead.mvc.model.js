$(document).ready(function () {
    /**
     * Creates and configures an autocomplete object
     * @param {object} obj The object to convert to the autocomplete object. Usually an object referring to an input box
     */
    function autocompletewrapper(obj) {
        var autos = new Bloodhound({
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.value);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                wildcard: "%QUERY",
                url: $(obj).data("autocomplete-url") + ($(obj).data("autocomplete-url").indexOf("?") >= 0)? "&" : "?" + "query=%QUERY",
                transform: function (autos) {
                    // Map the remote source JSON array to a JavaScript object array
                    return $.map(autos, function (auto) {
                        return {
                            value: auto.Name,
                            id: auto.Id
                        };
                    });
                }
            },
            identify: function (datum) {
                return datum.id;
            },
            limit: 10
        });

        autos.initialize();

        $(obj).typeahead({ highlight: true, minLength: 3, hint: true }, {
            name: 'autos', displayKey: 'value', source: autos
        }).on('typeahead:select', function (obj, datum) {
            onselected(obj, datum);
            }).on('typeahead:asyncrequest', function () {
                $('.typeahead').addClass('input-loading');
            })
            .on('typeahead:asynccancel typeahead:asyncreceive', function () {
                $('.typeahead').removeClass('input-loading');
            });

        //Check if a change callback was requested and bind it if it exists
        var trigger$ = $(obj);
        bindEvent(trigger$, 'typeahead:active');
        bindEvent(trigger$, 'typeahead:idle');
        bindEvent(trigger$, 'typeahead:open');
        bindEvent(trigger$, 'typeahead:close');
        bindEvent(trigger$, 'typeahead:change');
        bindEvent(trigger$, 'typeahead:render');
        bindEvent(trigger$, 'typeahead:select');
        bindEvent(trigger$, 'typeahead:autocomplete');
        bindEvent(trigger$, 'typeahead:cursorchange');
        bindEvent(trigger$, 'typeahead:asyncrequest');
        bindEvent(trigger$, 'typeahead:asynccancel');
        bindEvent(trigger$, 'typeahead:asyncreceive');

        if ($(obj).hasClass("focus")) {
            $(obj).focus();
        }

    }

    /**
     * Executes the initial On Selected code before any other functions bound to the select event, and sets the value of the selected id
     * @param {object} obj The object on which the event fired
     * @param {object} datum The value object that was selected
     */
    function onselected(obj, datum) {
        if (!obj || !obj.target || !datum) return;
        $('#' + $(obj.target).data("autocomplete-id-field")).val(datum.id.toString());
    }

    /**
     * Binds event callbacks passed as attributes on the trigger element
     * by convention searching for a data-event-name attribute and binding
     * to the function of the same name of it exists as a function.
     * So by passing an attribute called data-typeahead-change the
     * typeahead:change event can be bound
     * @param {object} trigger$ The object on which to trigger the event
     * @param {string} eventName The event name to bind to
     */
    function bindEvent(trigger$, eventName) {
        var eventAttribute = eventName.replace(':', '-');
        var _func = getFuncFromString(trigger$.data(eventAttribute));
        if (_func)
            trigger$.on(eventName, _func);
    }

    /**
    * From: http://stackoverflow.com/a/29947151/1085715
    * Converts a string containing a function or object method name to a function pointer.
    * @param {string} func The function as a string
    * @returns {function} The function pointer to execute
    */
    function getFuncFromString(func) {
        // if already a function, return
        if (typeof func === 'function') return func;

        // if string, try to find function or method of object (of "obj.func" format)
        if (typeof func === 'string') {
            if (!func.length) return null;
            var target = window;
            var funcList = func.split('.');
            while (funcList.length) {
                var ns = funcList.shift();
                if (typeof target[ns] === 'undefined') return null;
                target = target[ns];
            }
            if (typeof target === 'function') return target;
        }

        // return null if could not parse
        return null;
    }

    // On Document Ready: Converts all input boxes with a typeahead class and a data-autocomplete-url attribute to a typeahead object
    $('input[class~="typeahead"][data-autocomplete-url]')
            .each(function () {
                autocompletewrapper($(this));
            });
});