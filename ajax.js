class Ajax {
  constructor(options) {
    // Object used internally
    this.internal = {
      options: options,
      response: null,
      xhr: new XMLHttpRequest(),
      callbacks: [],
      success: function (callback) {
        this.callbacks.push({
          fn: callback,
          event: "success"
        });

        return this;
      },
      fail: function (callback) {
        this.callbacks.push({
          fn: callback,
          event: "fail"
        });

        return this;
      },
      done: function (callback) {
        this.callbacks.push({
          fn: callback,
          event: "done"
        });

        return this;
      },
      timeOut: function (callback) {
        this.callbacks.push({
          fn: callback,
          event: "timeout"
        });

        return this;
      },
      updateInternal: this._updateInternal.bind(this),
      timeout: this._timeout.bind(this),
      load: this._load.bind(this),
      open: this._open.bind(this),
      send: this._send.bind(this),
      readyState: this._readyState.bind(this),
    }

    // Assign promise properties
    if (options.type === "promise") {
      // Declare promise object
      this.internal.promise = {
        resolve: null,
        reject: null,
      }

      // Set Promise
      this.internal.promise.fn = new Promise(function (resolve, reject) {
        // Assign promise callbacks to object
        this.promise.resolve = resolve;
        this.promise.reject = reject;
      }.bind(this.internal))
    }

    // Send XHR
    return this._init();
  }

  _init() {
    let value;

    // Init XHR
    this.internal.open()
      .load()
      .timeout()
      .readyState()
      .send();

    if (this.internal.options.type === "promise") {
      value = this.internal.promise.fn;
    } else {
      value = this.internal;
    }

    return value;
  }

  _updateInternal(options) {
    // Append new options to internal
    Object.assign(this.internal, options);

    return this.internal;
  }

  _open() {
    // Open request on options
    this.internal.xhr.open(this.internal.options.method, this.internal.options.action);

    return this.internal;
  }

  _success(callback, data) {
    // Exec callback
    callback(data);

    return this.internal;
  }

  _fail(callback, data) {
    // Exec callback
    callback(data);

    return this.internal;
  }

  _timeout() {
    let internal = this.internal;

    // Event
    this.internal.xhr.addEventListener("timeout", function (e) {
      let timeout = internal.callbacks.filter((callback) => callback.event === "timeout"),
        data = Object.assign({}, {
          response: this,
          event: e
        }),
        callback;

      if (timeout.length === 0) {
        return;
      }

      callback = timeout[0].fn;

      callback(data);
    });

    return this.internal;
  }

  _load() {
    let internal = this.internal;

    // Event
    this.internal.xhr.addEventListener("load", function (e) {
      let done = internal.callbacks.filter((callback) => callback.event === "done"),
        data = Object.assign({}, {
          response: this,
          event: e
        }),
        callback;

      if (done.length === 0) {
        return;
      }

      callback = done[0].fn;

      callback(data);
    });

    return this.internal;
  }

  _readyState() {
    // On Ready State
    let ajaxMain = this,
      internal = this.internal;

    // Async
    this.internal.xhr.addEventListener("readystatechange", function (e) {
      // Success
      if (this.DONE === this.readyState && this.status === 200) {
        let success = internal.callbacks.filter((callback) => callback.event === "success"),
          data = Object.assign({}, {
            response: this,
            event: e
          }),
          callback;

        // Update internal object
        internal.updateInternal({
          response: this
        });

        /* 
        Return promise
        else return callback
        */
        if (internal.options.type === "promise") {
          callback = internal.promise.resolve;
        } else {
          // Return function
          try {
            callback = success[0].fn;
          } catch (e) {
            // Display error
            console.warn('Request was successful. But "success" method wasn\'t executed.');

            // Exit
            return;
          }
        }

        // Execute success
        ajaxMain._success(callback, data);
      }
      // Custom fail
      else if (this.DONE === this.readyState && this.status !== 200) {
        let fail = internal.callbacks.filter((callback) => callback.event === "fail"),
          data = Object.assign({}, {
            response: this,
            event: e
          }),
          callback;

        // Update internal object
        internal.updateInternal({
          response: this
        });

        /* 
        Return promise
        else return callback
        */
        if (internal.options.type === "promise") {
          callback = internal.promise.reject;
        } else {
          // Return function
          try {
            callback = fail[0].fn;
          } catch (e) {
            // Display error
            console.warn('Request has failed. But "fail" method wasn\'t executed.');

            // Exit
            return;
          }
        }

        // Execute fail
        ajaxMain._fail(callback, data)
      }
    });

    return this.internal;
  }

  _send() {
    // Send Request
    this.internal.xhr.send();

    return this.internal;
  }

}

var ajax = new Ajax({
  type: "promise",
  method: "GET",
  // action: "http://www.example.org/example.txt"
  action: window.location.href
  // action: "fail"
})


// Callback
// ajax.timeOut(function (response) {
//     console.log('fire', response)
//   })
//   .done(function (response, event) {
//     console.log('fire2', event)
//   })

// Promise
ajax.then((response) => console.log(response, "success")).catch((error) => console.log(error, "Error"));