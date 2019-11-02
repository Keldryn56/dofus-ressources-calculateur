init_editable();

function init_editable() {
    $('.ressource_label').editable({
        type: 'text',
        title: 'Enter username',
        unsavedclass: null,
        success: function(response, newValue) {
            $(this).text(newValue);
        }
    });
}
$("#upload_json").on("change", function(changeEvent) {
    if (!window.FileReader) return;
    for (var i = 0; i < changeEvent.target.files.length; ++i) {
        (function(file) {
            var loader = new FileReader();
            loader.onload = function(loadEvent) {
                if (loadEvent.target.readyState != 2)
                    return;
                if (loadEvent.target.error) {
                    alert("Error while reading file " + file.name + ": " + loadEvent.target.error);
                    return;
                }

                $("#calculate .form-group:not(.total)").remove();
                var el = jQuery.parseJSON(loadEvent.target.result);
                jQuery.each(el, function(i, v) {
                    add_ressource(v.name, v.price);
                });

                init_editable();
            };
            loader.readAsText(file);
        })(changeEvent.target.files[i]);
    }
});

$(document).on("submit", "#add_field_form", function(e) {
    e.preventDefault();
    var name = $("#add_field_form #name").val();
    var price = $("#add_field_form #price").val();
    add_ressource(name, price);
    $('.modal.add_field').modal('hide');
    reset_indexes();
    init_editable();
});

$(document).on("submit", "#calculate", function(e) {
    e.preventDefault();
    var total = 0;
    calculate();
});

$(document).on("click", ".remove", function() {
    $(this).parents(".form-group").remove();
    calculate();
    reset_indexes();
});

$(document).on("click", "#calculate input", function() {
    $(this).val('');
});

$("#add_field").click(function() {
    $("#add_field_form #name").val('');
    $("#add_field_form #price").val(0);
    $('.modal.add_field').modal('show');
});

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function reset() {
    $("#calculate .form-group:not(.total)").each(function() {
        $(this).find(".quantity").val(0);
    });
}

function export_json() {

    var ressource = {}; // my object
    var json = []; // my array

    $("#calculate .form-group:not(.total)").each(function() {
        var name = $(this).find("label").text();
        var price = $(this).find(".price").val();

        ressource = {
            name: name,
            price: price
        }

        json.push(ressource);
    });

    download("data.json", JSON.stringify(json, null, 2));

}

function reset_indexes() {
    var i = 0;
    $("#calculate .form-group:not(.total)").each(function() {
        $(this).attr('tabindex', i + 1);
        i++;
    });
}

function calculate() {
    var total = 0;
    $("#calculate .form-group:not(.total)").each(function() {
        total += parseInt($(this).find(".quantity").val()) * parseInt($(this).find(".price").val());
    });
    $("#total").val(numberWithSpaces(total));
}

function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function add_ressource(name, price) {
    let id = Math.random().toString(36).substring(7);

    var el = '<div class="form-group" id="' + id + '_container">';
    el += '<label class="ressource_label" for="' + id + '">' + name + '</label>';
    el += '<div class="input-group mb-2">';
    el += '<input type="number" tabindex=1 class="form-control quantity" id="' + id + '" placeholder="quantité" value="0">';
    el += '<input type="text" class="form-control price" id="' + id + '_u" placeholder="prix" value="' + price + '">';
    el += '<div class="input-group-text"><img src="kamas.png" alt="" style="max-height:20px"></div>';
    el += '<i class="fas fa-times-circle remove"></i>';
    el += '</div>';
    el += '</div>';

    $(el).insertBefore(".form-group.total");
}
