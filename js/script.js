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

var animate = {
  scroll: function (el) {
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

/* ------------- Events */

var events = {};

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

function getAnimationTime(el) {
  console.log(el.css('transition'));
  var time = el.css('transition').match(/[a-zA-Z-]+(?:\s+)([0-9]+(\.[0-9]+|))s/);
  if (time === '0') {
    time = el.css('animation').match(/[a-zA-Z-]+(?:\s+)([0-9]+(\.[0-9]+|))s/);
  }
  return (time==='0')?false:time;
}

events = {
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
    options.el.closest('form').find('input[class*="form-validate_"]').each(function () {
      if (formIsValid($(this))) {
        $(this).closest('.form-validate_container').removeClass('form-validate_container_has-error');
      } else {
        $(this).closest('.form-validate_container').addClass('form-validate_container_has-error');
        options.event.preventDefault();
      }
    });
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
      animate.scroll(options.el);
    }
    $('body').removeClass('popout-safe');
    $('.popout_is-active').removeClass('popout_is-active');
    $(options.target).addClass('popout_is-active');
  },
  'switch': function (options) {
    var checkbox = options.el.find('input[type="checkbox"]')[0];
    $(options.el).toggleClass('switch_is-on');
    $(options.el).toggleClass('switch_is-off');
    checkbox.checked = options.el.hasClass('switch_is-on');
  },
  'modal': function (options) {
    var target = $('#'+options.which);
    var animationTime = getAnimationTime(target);
    console.log(animationTime);
    target.addClass('modal_is-active');
    if (target.hasClass('is-animated')) {
    }
  }
}

dingo.keydown = {
  noinput: function (options) {
    options.event.preventDefault();
  }
}

dingo.keyup = {
  'form-validate-input': function (options) {
    function isEmail(string) {
      if (string.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9]+\.([a-z]{2}|[a-z]{3})($|\s+$)/)) {
        return true;
      } else {
        return false;
      }
    }
    if (options.type === 'email') {
      if (isEmail(options.el.val())) {
        options.el.addClass('form-validate_is-valid');
        options.el.closest('.form-validate_container').removeClass('form-validate_container_has-error');
      } else {
        options.el.removeClass('form-validate_is-valid');
      }
    } else if (options.type === 'text') {
      if (options.el.val().length > 0) {
        options.el.addClass('form-validate_is-valid');
        options.el.closest('.form-validate_container').removeClass('form-validate_container_has-error');
      } else {
        options.el.removeClass('form-validate_is-valid');
      }
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
    $('[name="'+options.targetName+'"]').val(options.value);
  },
  'mobile-popout_done': function (options) {
    events[options.dingo](options);
  },
  'switch': function (options) {
    events[options.dingo](options);
  },
  'modal': function (options) {
    events[options.dingo](options);
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
  }
}

$(function () {
  dingo.init();
});