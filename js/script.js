var dingo = {
  isMobile: function () {
    return ($(window).width() <= 400);
    return (navigator.userAgent.match(/iPhone|iPod|iPad|Android|BlackBerry/)) ? true : false;
  },
  htmlEvents: function () {
    if (dingo.isMobile()) {
      return ['touchend','touchmove','touchstart','touchleave','keyup','keydown','keypress'];
    } else {
      return ['click','mouseup','mouseenter','mouseleave','mousemove','keyup','keydown','keypress'];
    }
  },
  is: function (k,dingoEvent) {
    return (typeof dingo[k] === 'object' && typeof dingo[k][dingoEvent] === 'function');
  },
  toJs: function (options) {
    var match = options.dingo.match(/([a-zA-Z0-9_-]+)(?:\s+|)(\{([\s\S]*?)\}|)/);
    var options = {el:options.el,event: options.event,dingo: match[1]};

    if (typeof match[3] === 'string') {
      $.each(match[3].split(';'),function (i,k) {
        var _match = k.match(/([a-zA-Z0-9_-]+):([\s\S]*?)$/);
        options[_match[1]] = _match[2];
      });
    }

    return { dingoEvent: match[1], data: options };
  },
  exe: function (options) {
    var dingos = options.el.attr('data-dingo').match(/[a-zA-Z0-9_-]+(\s+|)(\{[\s\S]*?\}|)/g);
    var chain  = [];

    $.each(dingos,function (i,k) {
      chain.push(dingo.toJs({dingo: k,el: options.el,event: options.event}));
    });

    $.each(chain,function (i,k) {
      if (dingo.is(options.htmlEvent,k.dingoEvent)) {
        dingo[options.htmlEvent][k.dingoEvent](k.data);
      }
    });

  },
  init: function (el) {
    dingo.on($('[data-dingo]'));
  },
  on: function (el) {
    $.each(dingo.htmlEvents(),function (i,htmlEvent) {
      el.off(htmlEvent);
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

/* ------------- Animate */

function animate(el) {
  return {
    getCssProperty: function (property) {
      var arr     = ['','ms','webkit','Moz','O'];
      var style   = window.getComputedStyle(el[0]);
      var r;
      function capitalize(str) {
        return str[0].toUpperCase()+str.substr(1,str.length-1);
      }
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
      return false;
    },
    getTime: function () {
      var style = window.getComputedStyle(el[0]);
      var obj = {};

      obj.duration  = animate(el).jsTime(animate(el).getCssProperty('transitionDuration'));
      obj.delay     = animate(el).jsTime(animate(el).getCssProperty('transitionDelay'));

      if (obj.delay === 0 && obj.duration === 0) {
        obj.duration  = animate(el).jsTime(animate(el).getCssProperty('animationDuration'));
        obj.delay     = animate(el).jsTime(animate(el).getCssProperty('animationDelay'));
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
    in: function (callback) {
      return animate(el).init('in',callback);
    },
    out: function (callback) {
      return animate(el).init('out',callback);
    },
    init: function (direction,callback) {
      var time;
      var arr = (direction === 'out')?['out','in']:['in','out'];
      function exe() {
        el.removeClass('is-animated_'+arr[1]);
        el.addClass('is-animated_'+arr[0]);
        time = animate(el).getTime();
        setTimeout(function () {
          el.removeClass('is-animated_'+arr[0]);
          if (direction === 'in') {
            el.addClass('is-animated');
          } else {
            el.removeClass('is-animated');
          }
          if (typeof callback === 'function') {
            callback(el);
          }
        },time.duration+time.delay);
      }
      if (direction === 'in') {
        exe();
      } else if (direction === 'out' && el.hasClass('is-animated')) {
        exe();
      }
      return el;
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
}

/* ------------- Events */

function formIsValid(el) {
  if (el.hasClass('form-validate_is-valid')) {
    return true;
  } else {
    return false;
  }
}

function formValidate(el) {
  return formIsValid($(this));
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
    if (dingo.isMobile()) {
      clickable(options.event);
      toggle_mobile();
    } else {
      toggle_desktop();
    }
  },
  'form-validate-submit': function (options) {
    var bool = [];
    options.el.closest('form').find('input[class*="form-validate_"]').each(function () {
      if (formIsValid($(this))) {
        $(this).closest('.form-validate_container').removeClass('form-validate_container_has-error');
        bool.push(true);
      } else {
        animate($(this).closest('.form-validate_container')).in().addClass('form-validate_container_has-error');
        options.event.preventDefault();
        bool.push(false);
      }
    });
    if ($.inArray(false,bool) > -1) {
      return false;
    } else {
      return true;
    }
  },
  'form-validate-input': function (options) {
    function isEmail(string) {
      if (string.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9]+\.([a-z]{2}|[a-z]{3})($|\s+$)/)) {
        return true;
      } else {
        return false;
      }
    }
    var valid = {
      is: function () {
        options.el.addClass('form-validate_is-valid');
        animate(options.el.closest('.form-validate_container')).out().removeClass('form-validate_container_has-error');
      },
      not: function () {
        options.el.removeClass('form-validate_is-valid');
      }
    }
    if (options.type === 'email') {
      if (isEmail(options.el.val())) {
        valid.is();
      } else {
        valid.not();
      }
    } else if (options.type === 'text') {
      if (options.el.val().length > 0) {
        valid.is();
      } else {
        valid.not();
      }
    } else if (options.type === 'match') {
      if (options.el.val().length > 0) {
        if ($('[name="'+options.which+'"]').val() === options.el.val()) {
          valid.is();
        } else {
          valid.not();
        }
      } else {
        valid.not();
      }
    }
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
    animate($('#'+options.which)).in();
  },
  'close-modal-prompt': function (options) {
    animate($('#'+options.which)).out();
  },
  'delete-profile-picture': function (options) {
    animate($('#profile-picture-container')).in(function (el) {
      el.addClass('profile-picture-container_no-picture');
    });
    animate($('#profile-picture_all-controls')).in().addClass('profile-picture_all-controls_no-picture');
    sw($('#switch_display-profile-picture')).disabled();
  },
  'upload-profile-picture': function (options) {
    animate($('#profile-picture-container')).out().removeClass('profile-picture-container_no-picture');
    animate($('#profile-picture_all-controls')).in().removeClass('profile-picture_all-controls_no-picture');
    sw($('#switch_display-profile-picture')).enabled();
  },
  'modal': function (options) {
    var modal = $('#modal_'+options.which);
    modal.height($('body').height());
    animate(modal).in();
  },
  'modal-close': function (options) {
    var modal = $('#modal_'+options.which);
    animate(modal).out();
  },
  'modal-submit': function (options) {
    // this function returns a boolean, true if there are no errors
    // false if there are errors
    // so if there are no errors, it will close the modal,
    // else it will show errors
    if (events['form-validate-submit'](options)) {
      events['modal-close'](options)
    }
  },
  'item-video_delete': function (options) {
    var item = $('#item-video_'+options.which);
    animate(item).in(function () {
      // Delete item once the animation is complete
      item.remove();
    });
  },
  'hover-anim_in': function (options) {
    animate(options.el).in();
  },
  'hover-anim_out': function (options) {
    animate(options.el).out();
  }
}

dingo.keydown = {
  noinput: function (options) {
    // Prevent input on fields
    options.event.preventDefault();
  }
}

dingo.keyup = {
  'form-validate-input': function (options) {
    events[options.dingo](options);
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
    $('[name="'+options.targetName+'"]').val(options.value);
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

dingo.touchstart = {
  'form-validate-submit': function (options) {
    events[options.dingo](options);
  },
}

dingo.touchend = {
  'close-popouts': function (options) {
    events[options.dingo](options);
  },
  'form-validate-input': function (options) {
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
  }
}

$(function () {
  dingo.init();
});