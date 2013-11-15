// Dingo Version 1.1.1
// MIT License
// Coded by Sean MacIsaac
// seanjmacisaac@gmail.com

var dingoMouse = {};
var dingo = {
  isMobile: function () {
    //return ($(window).width() <= 400);
    if (navigator.userAgent.match(/iPhone|iPod|iPad|Android|BlackBerry/)) {
      return true;
    } else {
      return false;
    }
  },
  htmlEvents: function () {
    if (dingo.isMobile()) {
      return ['touchend','touchmove','touchstart','touchleave','keyup','keydown','keypress','change','focus','blur'];
    } else {
      return ['click','mousedown','mouseup','mouseenter','mouseleave','mousemove','keyup','keydown','keypress','change','focus','blur'];
    }
  },
  is: function (k,dingoEvent) {
    return (typeof dingo[k] === 'object' && typeof dingo[k][dingoEvent] === 'function');
  },
  get: function (el,event) {
    event      = event||'';
    var dingos = el.attr('data-dingo').match(/[a-zA-Z0-9_-]+(\s+|)(\{[^}]*?\}|)/g);
    var chain  = [];

    $.each(dingos,function (i,k) {
      chain.push(dingo.toJs({dingo: k,el: el,event: event}));
    });
    return chain;
  },
  toJs: function (options) {
    var match = options.dingo.match(/([a-zA-Z0-9_-]+)(?:\s+|)(\{([^}]*)\}|)/);
    var options = {el:options.el,event: options.event,dingo: match[1]};

    if (typeof match[3] === 'string' && match[3].length > 0) {
      $.each(match[3].split(';'),function (i,k) {
        var _match = k.match(/([a-zA-Z0-9_-]+):([^}]*)/);
        _match[2]  = _match[2].replace(/^\s+|\s+$/g,'');

        if (_match[2] === 'true') {
          _match[2] = true;
        } else if (_match[2] === 'false') {
          _match[2] = false;
        }

        options[_match[1]] = _match[2];
      });
    }

    return { dingoEvent: match[1], data: options };
  },
  getMouse: function (event) {
    if (dingo.isMobile()) {
      if (typeof event.changedTouches !== 'undefined') {
        return event.changedTouches[0];
      } else if (typeof event.originalEvent !== 'undefined') {
        return event.originalEvent.changedTouches[0];
      }
    } else {
      return event;
    }
  },
  uniMouse: function (event) {
    return {
      mousedown  : 'down',
      touchstart : 'down',
      mouseup    : 'up',
      touchend   : 'up',
      mousemove  : 'move',
      touchmove  : 'move'
    }[event];
  },
  swipeEvent: function (options,dingoEvent) {
    var rvalue = false,
        pageX  = dingo.getMouse(options.event).pageX,
        pageY  = dingo.getMouse(options.event).pageY,
        lr,
        ud;
    if (dingo.uniMouse(options.htmlEvent) === 'down') {
      dingoMouse.swipeEvent[dingoEvent] = {
        x: pageX,
        y: pageY
      }
      // A Swipe event only triggers during a certain amount of time
      setTimeout(function () {
        dingoMouse.swipeEvent[dingoEvent] = false;
      },300);
    } else if (dingo.uniMouse(options.htmlEvent) === 'up') {
      if (dingoMouse.swipeEvent[dingoEvent]) {
        rvalue = {
          options : options,
          dingo   : dingoEvent,
          originX : dingoMouse.swipeEvent[dingoEvent].x,
          originY : dingoMouse.swipeEvent[dingoEvent].y
        }
        lr = dingoMouse.swipeEvent[dingoEvent].x-pageX;
        ud = dingoMouse.swipeEvent[dingoEvent].y-pageY;
        if (Math.abs(lr) > Math.abs(ud) && Math.abs(lr) > 44) {
          // Left or Right
          if (lr > 0) {
            rvalue.event = 'swipeleft';
          } else {
            rvalue.event = 'swiperight';
          }
        } else if (Math.abs(ud) > 44) {
          // Up or Down
          if (ud > 0) {
            rvalue.event = 'swipeup';
          } else {
            rvalue.event = 'swipedown';
          }
        } else {
          rvalue = false;
        }
      }
    }
    return rvalue;
  },
  dragEvent: function (options,dingoEvent) {
    var rvalue = false,
        pageX  = dingo.getMouse(options.event).pageX,
        pageY  = dingo.getMouse(options.event).pageY;

    if (dingo.uniMouse(options.htmlEvent) === 'down') {
      dingoMouse.dragEvent[dingoEvent] = {
        originX: pageX,
        originY: pageY,
        dragstart: false
      }
    } else if (dingo.uniMouse(options.htmlEvent) === 'move' && dingoMouse.dragEvent[dingoEvent]) {
      if (Math.abs(dingoMouse.dragEvent[dingoEvent].originX-pageX) > 10 || Math.abs(dingoMouse.dragEvent[dingoEvent].originY-pageY) > 10) {
        rvalue = {
          originX : dingoMouse.dragEvent[dingoEvent].x,
          originY : dingoMouse.dragEvent[dingoEvent].y,
          pageX   : pageX,
          pageY   : pageY,
          options : options,
          dingo   : dingoEvent
        }
        if (dingoMouse.dragEvent[dingoEvent].dragstart) {
          rvalue.event = 'drag';
        } else {
          rvalue.event = 'dragstart';
          dingoMouse.dragEvent[dingoEvent].dragstart = true;
        }
      } else {
        rvalue = false;
      }
    } else if (dingo.uniMouse(options.htmlEvent) === 'up') {
      if (dingoMouse.dragEvent[dingoEvent].dragstart) {
        rvalue = {
          originX : dingoMouse.dragEvent[dingoEvent].x,
          originY : dingoMouse.dragEvent[dingoEvent].y,
          pageX   : pageX,
          pageY   : pageY,
          options : options,
          dingo   : dingoEvent,
          event   : 'dragend'
        }
        dingoMouse.dragEvent[dingoEvent] = false;
      }
    }
    return rvalue;
  },
  exe: function (options) {
    var chain  = dingo.get(options.el,options.event);
    var swipe;
    var drag;
    var dingoEvent;

    $.each(chain,function (i,k) {
      dingoEvent = k.dingoEvent;
      swipe      = dingo.swipeEvent(options,dingoEvent);
      drag       = dingo.dragEvent(options,dingoEvent);

      if (dingo.is(options.htmlEvent,dingoEvent)) {
        dingo[options.htmlEvent][dingoEvent](k.data);
      }
      if (swipe && dingo.is(swipe.event,dingoEvent)) {
        dingo[swipe.event][dingoEvent](k.data);
      }
      if (drag && dingo.is(drag.event,dingoEvent)) {
        dingo[drag.event][dingoEvent](k.data);
      }
    });
  },
  init: function (el) {
    dingoMouse.swipeEvent = {};
    dingoMouse.dragEvent = {};
    dingo.on($('[data-dingo]'));
  },
  on: function (el) {
    $.each(dingo.htmlEvents(),function (i,htmlEvent) {
      el.on(htmlEvent,function (event) {
        dingo.exe({htmlEvent:htmlEvent,el:$(this),event: event});
      });
    });
  }
}

/* Switch Controls */

function sw(el) {
  return {
    disabled: function () {
      el.addClass('switch_is-disabled');
      return el;
    },
    enabled: function () {
      el.removeClass('switch_is-disabled');
      return el;
    },
    toggle: function (bool) {
      var checkbox = el.find('input[type="checkbox"]')[0];
      if (typeof bool === 'boolean') {
        if (bool) {
          $(el).addClass('switch_is-on');
          $(el).removeClass('switch_is-off');
        } else {
          $(el).removeClass('switch_is-on');
          $(el).addClass('switch_is-off');
        }
      } else {
        $(el).toggleClass('switch_is-on');
        $(el).toggleClass('switch_is-off');
      }
      checkbox.checked = sw(el).on();
    },
    on: function () {
      return el.hasClass('switch_is-on');
    }
  }
}

/* ------------- Dropdown Delay */

/*
  Checks to see fi the body can receive touch events
*/

function clickable(event) {
  if ($('body').hasClass('dropdown-delay')) {
    event.preventDefault();
  }
}

/*
    This function prevents any other element from having a
    click event after the mobile selection menu is dismis-
    sed and the page is is still receptive to 'touching'
*/

function dropdownDelay() {
  $('body').addClass('dropdown-delay');
  setTimeout(function () {
    $('body').removeClass('dropdown-delay');
  },100);
}

/* ------------- Animate v1.1.2 */
// MIT License
// Original Code by Sean MacIsaac

function animate(el) {
  return {
    getCssProperty: function (property) {
      var arr     = ['','ms','webkit','Moz','O'];
      var style   = window.getComputedStyle(el[0]);
      var r;
      function capitalize(str) {
        return str[0].toUpperCase()+str.substr(1,str.length-1);
      }
      if (style !== null) {
        for (var i=0;i < arr.length;i++) {
          if (arr[i].length < 1) {
            r = property;
          } else {
            r = arr[i]+capitalize(property);
          }
          if (typeof style[r] === 'string') {
            return style[r];
          }
        }
      }
      return false;
    },
    getTime: function () {
      var obj = {
        duration : 0,
        delay    : 0
      };
      // For IE 8
      if (typeof window.getComputedStyle === 'function') {
        obj.duration  = animate(el).jsTime(animate(el).getCssProperty('transitionDuration'));
        obj.delay     = animate(el).jsTime(animate(el).getCssProperty('transitionDelay'));

        if (obj.delay === 0 && obj.duration === 0) {
          obj.duration  = animate(el).jsTime(animate(el).getCssProperty('animationDuration'));
          obj.delay     = animate(el).jsTime(animate(el).getCssProperty('animationDelay'));
        }
      }
      return obj;
    },
    jsTime: function (style) {
      if (style) {
        return parseFloat(style.match(/([0-9]+(\.[0-9]+|))s/)[1])*1000;
      } else {
        return 0;
      }
    },
    start: function (callback) {
      return animate(el).init('in',callback);
    },
    end: function (callback) {
      return animate(el).init('out',callback);
    },
    custom: function (name,callback) {
      var time = animate(el).getTime();
      setTimeout(function () {
        el.removeClass(name);
        if (typeof callback === 'function') {
          callback(el);
        }
      },time.duration+time.delay);
      el.addClass(name);
      return el;
    },
    toggle: function () {
      if (el.hasClass('is-animated_in')) {
        animate(el).end();
      } else {
        animate(el).start();
      }
    },
    classSwitch: function (arr) {
      el.removeClass('is-animated_'+arr[1]);
      el.addClass('is-animated_'+arr[0]);
      return animate(el);
    },
    ifOut: function (direction,arr,callback) {
      var time = animate(el).getTime();
      setTimeout(function () {
        if (direction === 'out') {
          el.removeClass('is-animated_'+arr[0]);
        }
        if (typeof callback === 'function') {
          callback(el);
        }
      },time.duration+time.delay);
      return animate(el);
    },
    init: function (direction,callback) {
      if (typeof el[0] === 'undefined') {
        return false;
      } else {
        var arr = (direction === 'out')?['out','in']:['in','out'];
        function exe() {
          animate(el).classSwitch(arr).ifOut(direction,arr,callback);
        }
        if (direction === 'in') {
          exe();
        } else if (direction === 'out' && el.hasClass('is-animated_in')) {
          exe();
        }
        return el;
      }
    },
    scroll: function () {
      var time   = 70;
      var pos    = el.offset().top-20;
      var start  = window.pageYOffset;
      var i      = 0;
      var frames = 20;

      function s() {
        i++;
        window.scrollTo(0,(start-((start/frames)*i))+((pos/frames)*i));
        if (i<frames) {
          setTimeout(function () {
            s();
          },(time/frames));
        }
      };
      s();
    }
  }
};

/* ------------- Events */

function formValidate(el) {
  var form = el.closest('form');

  if (el[0].tagName.toLowerCase === 'form') {
    form = el;
  } else {
    var baseName = (el.attr('name'))?el.attr('name').replace(/^confirm-/g,''):'';
    var base     = form.find('[name="' + baseName + '"]');
    var confirm  = form.find('[name="confirm-' + baseName + '"]');
  }

  function camelCase(string) {
    string = string.replace(/\(|\)/,'').split(/-|\s/);
    var out = [];
    for (var i = 0;i<string.length;i++) {
      if (i<1) {
        out.push(string[i].toLowerCase());
      } else {
        out.push(string[i][0].toUpperCase() + string[i].substr(1,string[i].length).toLowerCase());
      }
    }
    return out.join('');
  }

  function nullBool(value) {
    if (value) {
      return true;
    } else {
      return false;
    }
  }

  return {
    confirm: function () {

      function convert (el) {
        var attr = camelCase(el.attr('name')).toLowerCase();
        var tag  = el[0].tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
          if (attr.match(/^zip(code|)$/)) {
            return 'zipCode';
          } else if (attr.match(/^(confirm|)(new|old|current|)password$/)) {
            return 'password'
          } else if (attr.match(/^(confirm|)(new|old|current|)email$/)) {
            return 'email';
          } else if (attr.match(/^(confirm|)phone(number|)$/)) {
            return 'phone';
          } else {
            return 'text';
          }
        } else {
          return tag;
        }
      }

      function rules (el) {
        var string = el.val()||'';
        return {
          text: function () {
            return (string.length > 0);
          },
          password: function () {
            return (string.length > 0 && nullBool(string.match(/[a-zA-Z0-9_-]+/)));
          },
          zipCode: function () {
            return (nullBool(string.match(/[0-9]{5}/)));
          },
          email: function () {
            return (nullBool(string.match(/[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.([a-z]{2}|[a-z]{3})/)));
          },
          merchantId: function () {
            var match = string.match(/^[A-Z0-9]+$/);
            return ((match) && (match[0].length > 9 && match[0].length < 22));
          },
          marketplaceId: function () {
            var match  = string.match(/^[A-Z0-9]+$/);
            var length = {'United States of America':13}[region];
            return ((match) && (match[0].length === length));
          },
          select: function () {
            return (el[0].selectedIndex > 0);
          },
          checkbox: function () {
            return el[0].checked;
          },
          phone: function () {
            return (nullBool(string.match(/^([0-9]{7}|[0-9]{10})$/)));
          }
        }
      }; // Rules

      function fullfill(el,bool) {
        var label  = $('[for="' + el.attr('name') + '"]');
        var prompt = el.closest('.input-group').find('.form-validate-prompt');
        if (bool) {
          el.removeClass('form-validate');
          label.addClass('form-validate-label_is-fufilled');
          animate(prompt).end();
        } else {
          el.addClass('form-validate');
          label.removeClass('form-validate-label_is-fufilled');
        }
      };
      // Confirmation field check, checks is first condition is truthy then
      // checks if the fields are mirrors

      // Make sure that base & confirm satisfies rules

      fullfill(base,rules(base)[convert(base)]());

      if (confirm.size() > 0) {
        fullfill(confirm,(rules(confirm)[convert(base)]() && base.val() === confirm.val()));
      }
    },
    init: function (base, confirm) {
      if (el.size() > 0) {
        parameters.bool = bool;
        formValidate(el).fufilled();
        return formValidate(el);
      } else {
        return false;
      }
    },
    is: function () {
      return (form.find('.form-validate').size() < 1);
    },
    check: function () {
      form.find('[data-dingo*="form-validate"]').each(function () {
        if (!nullBool($(this).attr('data-dingo').match(/form-validate-submit/))) {
          formValidate($(this)).confirm();
        }
      });
      return form.find('.form-validate');
    },
    submit: function (event) {
      var requiredField = formValidate(form).check();
      var prompt;
      if (requiredField.size() > 0) {
        event.preventDefault();
        requiredField.each(function () {
          prompt = $(this).closest('.input-group').find('.form-validate-prompt');
          prompt.addClass('form-validate-prompt_is-active');
          animate(prompt).start();
        });
        if (requiredField.eq(0).closest('[class*="modal"]').size() < 1) {
          animate(requiredField.eq(0)).scroll();
        }
      }
    }
  }
}

var events = {
  'close-popouts': function (options) {
    function toggle_desktop() {
      $('.is-popout').each(function () {
        var active = $(this).hasClass('popout_is-active');
        if (active && $('body').hasClass('popout-safe')) {
          $('body').removeClass('popout-safe');
          $(this).removeClass('popout_is-active');
        } else if (active && !$('body').hasClass('popout-safe')) {
          $('body').addClass('popout-safe');
        }
      });
    }
    /* Will remove later at refactor */
    function toggle_mobile() {
      $('.is-popout').each(function () {
        var active = $(this).hasClass('popout_is-active');
        if (active && $('body').hasClass('popout-safe')) {
          if ($(this)[0] !== $(options.event.target).closest('.is-popout')[0]) {
            $('body').removeClass('popout-safe');
            $(this).removeClass('popout_is-active');
          }
        } else if (active && !$('body').hasClass('popout-safe')) {
          $('body').addClass('popout-safe');
        }
      });
    }
    function closeEl(selector) {
      if ($('body').hasClass('popout-safe')) {
        $(selector).each(function () {
          if ($(options.event.target).closest(selector)[0] !== $(this)[0]) {
            animate($(this)).end();
            $('body').removeClass('popout-safe');
          }
        });
      } else {
        $('body').addClass('popout-safe');
      }
    }
    if (dingo.isMobile()) {
      clickable(options.event);
      toggle_mobile();
    } else {
      toggle_desktop();
    }
    closeEl('.close-popout');
  },
  'form-validate_keyup': function (options) {
    formValidate(options.el).confirm();
  },
  'form-validate_click': function (options) {
    if (options.el.attr('type') === 'checkbox') {
      formValidate(options.el).confirm(options.el.attr('type'));
    }
  },
  'form-validate_change': function (options) {
    if (options.el[0].tagName === 'SELECT') {
      formValidate(options.el).confirm(options.el[0].tagName.toLowerCase());
    }
  },
  'form-validate-submit': function (options) {
    formValidate($('#'+options.which)).submit(options.event);
  },
  'mobile-popout-select': function (options) {
    var active = options.el.siblings().filter('.popout-select_is-active');
    active.removeClass('popout-select_is-active');
    options.el.addClass('popout-select_is-active');
  },
  'mobile-popout_done': function (options) {
    $('#'+options.popout).removeClass('popout_is-active');
    $('[name="'+options.targetName+'"]').val($('#'+options.target).find('.popout-select_is-active').text());
    $('body').removeClass('popout-safe');
    $('[name="'+options.targetName+'"]').trigger('keyup');

    dropdownDelay();
  },
  'popout': function (options) {
    if (dingo.isMobile()) {
      options.target+="_mobile";
      animate(options.el).scroll();
    }
    $('body').removeClass('popout-safe');
    $('.popout_is-active').removeClass('popout_is-active');
    $(options.target).addClass('popout_is-active');
  },
  'popout-select-done': function (options) {
    $('[name="'+options.targetName+'"]').val(options.value);
    $('[name="'+options.targetName+'"]').trigger('keyup');
  },
  'switch': function (options) {
    // This is checking for a switch group
    var switchGroup = $('[name="'+options.el.attr('name')+'"]').filter('.switch');

    if (switchGroup.size() > 1) {
      if (!sw(options.el).on()) {
        sw(options.el).toggle(true);
        switchGroup.each(function () {
          if ($(this)[0] !== options.el[0]) {
            sw($(this)).toggle(false);
          }
        });
      }
    } else {
      sw(options.el).toggle();
    }
  },
  'modal-prompt': function (options) {
    animate($('#'+options.which)).start();
  },
  'close-modal-prompt': function (options) {
    animate($('#'+options.which)).end();
  },
  'delete-profile-picture': function (options) {
    animate($('#profile-picture-container')).start(function (el) {
      el.addClass('profile-picture-container_no-picture');
    });
    animate($('#profile-picture_all-controls')).start().addClass('profile-picture_all-controls_no-picture');
    sw($('#switch_display-profile-picture')).disabled();
  },
  'upload-profile-picture': function (options) {
    animate($('#profile-picture-container')).end().removeClass('profile-picture-container_no-picture');
    animate($('#profile-picture_all-controls')).start().removeClass('profile-picture_all-controls_no-picture');
    sw($('#switch_display-profile-picture')).enabled();
  },
  'modal': function (options) {
    var modal = $('#modal_'+options.which);
    modal.height($('body').height());
    animate(modal).start();
  },
  'modal-close': function (options) {
    var modal = $('#modal_'+options.which);
    animate(modal).end();
  },
  'modal-submit': function (options) {
    if (formValidate(options.el).is()) {
      events['modal-close'](options);
    } else {
      options.which = options.form;
      events['form-validate-submit'](options);
    }
  },
  'item-video_delete': function (options) {
    var item = $('#item-video_'+options.which);
    animate(item).start(function () {
      // Delete item once the animation is complete
      item.remove();
    });
  },
  'input-dropdown_open': function (options) {
    animate($('#'+options.id)).start();
  },
  'input-dropdown_close': function (options) {
    animate($('#'+options.id)).end();
    $('body').removeClass('popout-safe');
  },
  'swipe_message-item_control': function (options) {
    animate(options.el.find('.message-item_control')).start();
  },
  'delete-or-archive_message-item':function (options) {
    var message = $('#'+options.id);
    function exe(string) {
      $('#'+options.id).addClass(options.id.replace(/_[0-9]+/,'') + '_'+string);
      animate(message).start(function (el) {
        message.remove();
      });
    }
    return {
      'del': function () {
        exe('delete');
      },
      'archive': function () {
        exe('archive');
      }
    }
  },
  'delete_message-item': function (options) {
    events['delete-or-archive_message-item'](options).del();
  },
  'archive_message-item': function (options) {
    events['delete-or-archive_message-item'](options).archive();
  },
  'delete-message': function (options) {
    $('.message-header').addClass('message-header_is-deleted');
    $('.message-body').addClass('message-body_is-deleted');
    $(options.el).closest('.nav-bar_control').find('.btn-disarm').each(function () {
      $(this).attr('disabled','disabled');
    });
  },
  'carousel-control': function (options) {
    var carousel = $(options.which);
    var first    = carousel.find('.carousel-item').eq(0);
    var last     = carousel.find('.carousel-item:last-child');
    if (options.direction === 'prev') {
      animate(last).custom('carousel-item_in').insertBefore(first);
    } else {
      animate(first).custom('carousel-item_out',function () {
        first.insertAfter(last);
      });
    }
  },
  'video-item_view': function (options) {
    var selected      = $(options.which);
    var img           = selected.find('img').clone();
    var feature       = $('#featured-video');
    var container     = feature.find('.featured-video_container');
    var container_new = container.clone();
    var anim          = animate(container_new);

    container_new[0].className = 'featured-video_container';
    container_new.find('img').remove();
    container_new.append(img);

    $('.video-item_is-active').removeClass('video-item_is-active');
    selected.addClass('video-item_is-active');

    feature.append(container_new);

    anim.start(function (el) {
      container.remove();
    });
  }
}

dingo.keydown = {
  noinput: function (options) {
    // Prevent input on fields
    options.event.preventDefault();
  }
}

dingo.keyup = {
  'form-validate': function (options) {
    events[options.dingo + '_keyup'](options);
  }
}

dingo.keypress = {
  'form-validate': function (options) {
    alert('test');
    if (dingo.isMobile()) {
      events[options.dingo + '_keyup'](options);
    }
  }
}

dingo.blur = {
  'form-validate': function (options) {
    if (options.el[0].tagName.toLowerCase() === 'input') {
      events[options.dingo + '_keyup'](options);
    }
  }
}

dingo.click = {
  'close-popouts': function (options) {
    events[options.dingo](options);
  },
  'form-validate-submit': function (options) {
    events[options.dingo](options);
  },
  'popout': function (options) {
    events[options.dingo](options);
  },
  'mobile-popout-select': function (options) {
    events[options.dingo](options);
  },
  'popout-select-done': function (options) {
    events[options.dingo](options);
  },
  'mobile-popout_done': function (options) {
    events[options.dingo](options);
  },
  'switch': function (options) {
    events[options.dingo](options);
  },
  'modal-prompt': function (options) {
    events[options.dingo](options);
  },
  'close-modal-prompt': function (options) {
    events[options.dingo](options);
  },
  'delete-profile-picture': function (options) {
    events[options.dingo](options);
  },
  'upload-profile-picture': function (options) {
    events[options.dingo](options);
  },
  'modal': function (options) {
    events[options.dingo](options);
  },
  'modal-close': function (options) {
    events[options.dingo](options);
  },
  'modal-submit': function (options) {
    events[options.dingo](options);
  },
  'item-video_delete': function (options) {
    events[options.dingo](options);
  },
  'input-dropdown_open': function (options) {
    events[options.dingo](options);
  },
  'input-dropdown_close': function (options) {
    events[options.dingo](options);
  },
  'delete_message-item': function (options) {
    events[options.dingo](options);
  },
  'archive_message-item': function (options) {
    events[options.dingo](options);
  },
  'delete-message': function (options) {
    events[options.dingo](options);
  },
  'carousel-control': function (options) {
    events[options.dingo](options);
  },
  'video-item_view': function (options) {
    events[options.dingo](options);
  }
}

dingo.mouseenter = {
  'hover-anim': function (options) {
    events[options.dingo+'_in'](options);
  }
}

dingo.mouseleave = {
  'hover-anim': function (options) {
    events[options.dingo+'_out'](options);
  }
}

dingo.swipeleft = {
  'swipe_message-item_control': function (options) {
    events[options.dingo](options);
  }
}

dingo.swiperight = {
  'swipe_message-item_control': function (options) {
    events[options.dingo](options);
  }
}

dingo.touchstart = {
  'form-validate': function (options) {
    events[options.dingo](options);
  },
}

dingo.touchend = {
  'close-popouts': function (options) {
    events[options.dingo](options);
  },
  'form-validate-submit': function (options) {
    events[options.dingo](options);
  },
  'mobile-popout-select': function (options) {
    events[options.dingo](options);
  },
  'mobile-popout_done': function (options) {
    events[options.dingo](options);
  },
  'switch': function (options) {
    events[options.dingo](options);
  },
  'popout': function (options) {
    events[options.dingo](options);
  },
  'modal-prompt': function (options) {
    events[options.dingo](options);
  },
  'close-modal-prompt': function (options) {
    events[options.dingo](options);
  },
  'modal': function (options) {
    events[options.dingo](options);
  },
  'modal-close': function (options) {
    events[options.dingo](options);
  },
  'modal-submit': function (options) {
    events[options.dingo](options);
  },
  'item-video_delete': function (options) {
    events[options.dingo](options);
  },
  'input-dropdown_open': function (options) {
    events[options.dingo](options);
  },
  'input-dropdown_close': function (options) {
    events[options.dingo](options);
  },
  'delete-profile-picture': function (options) {
    events[options.dingo](options);
  },
  'upload-profile-picture': function (options) {
    events[options.dingo](options);
  },
  'delete_message-item': function (options) {
    events[options.dingo](options);
  },
  'archive_message-item': function (options) {
    events[options.dingo](options);
  },
  'video-item_view': function (options) {
    events[options.dingo](options);
  }
}

var carousel = function (el) {
  var items     = el.find('.carousel-item');
  var itemWidth = items.eq(0).outerWidth();
  var container = el.find('.carousel-track');
  return {
    init: function () {
      container.css('width',(itemWidth*items.size())+'px');
      animate(el).start();
      return carousel(el);
    }
  }
}

$(function () {
  carousel($('#video-carousel')).init();
  dingo.init();
});