(function(window, document, undefined) {

  function refreshElements() {
    this.xtag.fields.innerHTML = '';
    var pin = this;
    for (var i = 0; i < this.size; i++) {
      var elem = document.createElement('input');
      elem.setAttribute('type', 'password');
      elem.setAttribute('size', '1');
      elem.setAttribute('maxlength', '1');
      elem.setAttribute('data-index', i);
      function updateValue() {
          var val = [].splice.call(pin.value, 0);
          val[this.dataset.index] = this.value;
          pin.xtag.input.value = val.join('');          
      }
      elem.onchange = function (e){
        updateValue.call(this);
      };
      elem.onkeypress = function (e){
          // Only allow the user to type digits
          if (e.charCode < '0'.charCodeAt(0) || e.charCode > '9'.charCodeAt(0)) {
              e.preventDefault();
              return;
          }
          var inputEl = this;
          setTimeout(function() {
              xtag.fireEvent(pin, 'changed', { pin: inputEl.value });
          },1);
      };
      elem.oninput = function (e){
        updateValue.call(this);
        var fields = pin.xtag.fields.childNodes;
        var i = parseInt(this.dataset.index, 10) + 1;
        if (this.value.length && i < pin.size) {
          fields[i].focus();
        }
      };
      if (this.value[i]) elem.value = this.value[i];
      this.xtag.fields.appendChild(elem);
    }
    xtag.fireEvent(this, 'changed', { value: this.value });
  }

  xtag.register('x-pin', {
    onCreate: function() {
      this.innerHTML = '<input type="hidden" /><div class="x-pin-fields"></div>';
      this.xtag.input = xtag.query(this, 'input')[0];
      this.xtag.input.value = '';
      this.xtag.fields = xtag.query(this, '.x-pin-fields')[0];
      this.name = this.getAttribute('name');
      refreshElements.call(this);
    },
    getters: {
      size: function() {
        return parseInt(this.getAttribute('size'), 10);
      },
      value: function() {
        return this.xtag.input.value;
      },
      name: function() {
        return this.xtag.input.getAttribute('name');
      }
    },
    setters: {
      size: function(value) {
        this.setAttibute('size', value);
        refreshElements.call(this);
      },
      value: function(value) {
        if (typeof value !== 'undefined') {
          this.xtag.input.setAttribute('value', value);
          refreshElements.call(this);
        }
      },
      'name:attribute(name)': function(value) {
        this.xtag.input.setAttribute('name', value);
      }
    }
  });

})(window, window.document);
