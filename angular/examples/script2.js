/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));

/*!
 * OTK v0.0.0 (http://www.origin.com)
 * Copyright 2011-2014 Electronic Arts Inc.
 * Licensed under MIT ()
 */

if (typeof jQuery === 'undefined') { throw new Error('OTK\'s JavaScript requires jQuery') }

/* ========================================================================
 * OTK: transition.js
 * http://docs.x.origin.com/OriginToolkit/
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();
    });

}(jQuery));

/* ========================================================================
 * OTK: dropdown.js
 * http://docs.x.origin.com/OriginToolkit/#/dropdowns
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function ($) {
    'use strict';

    // Constants
    // =========================
    var CLS_DROPDOWN_VISIBLE = 'otkdropdown-visible',
        backdrop = '.otkdropdown-backdrop',
        toggle   = '[data-toggle=otkdropdown]';


    function clearMenus(e) {
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent = getParent($(this)),
                relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(CLS_DROPDOWN_VISIBLE)) {
                return;
            }
            $parent.trigger(e = $.Event('hide.otk.dropdown', relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $parent
                .removeClass(CLS_DROPDOWN_VISIBLE)
                .trigger('hidden.otk.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN CLASS DEFINITION
    // =========================
    var Dropdown = function(element) {
        $(element).on('click.otk.dropdown', this.toggle);
    };

    Dropdown.prototype.toggle = function(e) {

        var $this = $(this);

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        clearMenus();

        if (!isActive) {

            // don't worry about this for now.
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="otkdropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.otk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent
                .toggleClass(CLS_DROPDOWN_VISIBLE)
                .trigger('shown.otk.dropdown', relatedTarget);

            $this.focus();
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {

        if (!/(38|40|27)/.test(e.keyCode)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) {
            return;
        }

        var $parent  = getParent($this),
            isActive = $parent.hasClass(CLS_DROPDOWN_VISIBLE);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) {
                $parent.find(toggle).focus();
            }
            return $this.click();
        }

        var desc = ' li:not(.divider):visible a',
            $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc);

        if (!$items.length) {
            return;
        }

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) {
            index--; // up
        }
        if (e.keyCode == 40 && index < $items.length - 1) {
            index++; // down
        }
        if (index === -1) {
            index = 0;
        }
        $items.eq(index).focus();
    };


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkdropdown;

    $.fn.otkdropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.dropdown');
            if (!data) {
                $this.data('otk.dropdown', (data = new Dropdown(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.otkdropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.otkdropdown.noConflict = function() {
        $.fn.otkdropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.otk.dropdown.data-api', clearMenus)
        .on('click.otk.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.otk.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.otk.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown);

}(jQuery));

/* ========================================================================
 * OTK: progressbar.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // Constants
    // =========================
    var TWO_PI = 2 * Math.PI,
        CLS_PROGRESS_PREPARING = 'otkprogress-radial-ispreparing',
        CLS_PROGRESS_ACTIVE = 'otkprogress-radial-isactive',
        CLS_PROGRESS_COMPLETE = 'otkprogress-radial-iscomplete',
        CLS_PROGRESS_PAUSED = 'otkprogress-radial-ispaused',

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


    // DROPDOWN CLASS DEFINITION
    // =========================
    var ProgressBar = function(element, options) {

        var $element = $(element),
            $canvas = $element.find('canvas'),
            canvas = $canvas[0];

        this.element = $element;
        this.options = $.extend({}, ProgressBar.DEFAULTS, options);
        this.canvas = $canvas;
        this.context = canvas.getContext('2d');
        this.val = parseInt($canvas.attr('data-value'), 10);
        this.max = parseInt($canvas.attr('data-max'), 10);
        this.animating = false;

        canvas.width = this.options.circleW;
        canvas.height = this.options.circleH;
        this.setPreparing();

    };

    // default configuration
    ProgressBar.DEFAULTS = {
        circleX: 90,
        circleY: 90,
        circleR: 80,
        circleW: 180,
        circleH: 180,
        circleBg: 'rgba(33, 33, 33, 0.8)',
        circleLineBg: '#696969',
        circleLineWidth: 6,
        circleLineColors: {
            'active': '#26c475',
            'paused': '#fff',
            'complete': '#26c475'
        },
        indeterminateRate: TWO_PI * (1 / 60),
        indeterminateStart: TWO_PI * 0.75,
        indeterminateCirclePercent: 0.85
    };

    ProgressBar.prototype.update = function() {
        var val = parseInt(this.canvas.attr('data-value'), 10),
            diff = val - this.val;
        if ((val > this.val) && !this.animating) {
            this.animating = true;
            this.animate(this.getTween(diff), 0);
        }
    };

    ProgressBar.prototype.setPaused = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PAUSED);
        this.element.attr('data-status', 'paused');
        this.render(this.val);
    };

    ProgressBar.prototype.setActive = function() {
        this.element
            .removeClass(CLS_PROGRESS_PREPARING)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_ACTIVE);
        this.element.attr('data-status', 'active');
        this.render(this.val);
    };

    ProgressBar.prototype.setPreparing = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_COMPLETE)
            .addClass(CLS_PROGRESS_PREPARING);
        this.element.attr('data-status', 'preparing');
        this.render(0);
    };

    ProgressBar.prototype.setComplete = function() {
        this.element
            .removeClass(CLS_PROGRESS_ACTIVE)
            .removeClass(CLS_PROGRESS_PAUSED)
            .removeClass(CLS_PROGRESS_PREPARING)
            .addClass(CLS_PROGRESS_COMPLETE);
        this.element.attr('data-status', 'complete');
        if (!this.animating) {
            this.animating = true;
            this.animateIndeterminate(this.options.indeterminateStart);
        }
    };

    //for the base circle (no progress)
    ProgressBar.prototype.drawCircle = function() {
        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, 0, TWO_PI);
        this.context.fillStyle = this.options.circleBg;
        this.context.fill();
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = this.options.circleLineBg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawProgress = function(val) {
        var progressPercent = val / this.max,
            start = TWO_PI * (3 / 4),
            end = (TWO_PI * progressPercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();
    };

    ProgressBar.prototype.drawIndeterminiteCircle = function(start) {
        var end = (TWO_PI * this.options.indeterminateCirclePercent) + start,
            status = this.element.attr('data-status'),
            bg = this.options.circleLineColors[status];

        this.context.beginPath();
        this.context.arc(this.options.circleX, this.options.circleY, this.options.circleR, start, end);
        this.context.lineWidth = this.options.circleLineWidth;
        this.context.strokeStyle = bg;
        this.context.stroke();

    };

    ProgressBar.prototype.render = function(val) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawProgress(val);
    };

    ProgressBar.prototype.renderComplete = function(start) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle();
        this.drawIndeterminiteCircle(start);
    };

    ProgressBar.prototype.animate = function(tween, i) {
        this.val += tween[i];
        this.render(this.val);
        if (i < tween.length - 1) {
            requestAnimationFrame($.proxy(function() {
                i++;
                this.animate(tween, i);
            }, this));
        } else {
            this.animating = false;
        }
    };

    ProgressBar.prototype.animateIndeterminate = function(start) {
        start += this.options.indeterminateRate;
        this.renderComplete(start);
        requestAnimationFrame($.proxy(function() {
            this.animateIndeterminate(start);
        }, this));
    };

    ProgressBar.prototype.getTween = function(diff) {
        // sum of squares for easing
        var tween = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        for (var i = 0, j = tween.length; i < j; i++) {
            tween[i] = diff * (tween[i] / 100);
        }
        return tween;
    };


    // PROGRESSBAR PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkprogressbar;

    $.fn.otkprogressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.progressbar');
            if (!data) {
                $this.data('otk.progressbar', (data = new ProgressBar(this)));
            }
            if (typeof(option) == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkprogressbar.Constructor = ProgressBar;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkprogressbar.noConflict = function () {
        $.fn.otkprogressbar = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================
    $(window).on('load', function() {
        $('[data-otkprogressbar="radial"]').each(function() {
            var $progressbar = $(this),
                data = $progressbar.data();
            $progressbar.otkprogressbar(data);
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: carousel.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.otkcarousel-indicators');
        this.options = options;
        this.paused =
        this.sliding =
        this.interval =
        this.$active =
        this.$items = null;

        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

    };

    Carousel.DEFAULTS = {
        interval: 500000,
        pause: 'hover',
        wrap: true
    };

    Carousel.prototype.cycle =  function (e) {
        if (!e) {
            this.paused = false;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.options.interval && !this.paused) {
            this.interval = setInterval($.proxy(this.next, this), this.options.interval);
        }
        return this;
    };

    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find('.otkcarousel-item-active');
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active);
    };

    Carousel.prototype.to = function (pos) {
        var that = this,
            activeIndex = this.getActiveIndex();

        if (pos > (this.$items.length - 1) || pos < 0) {
            return;
        }
        if (this.sliding) {
            return this.$element.one('slid.otk.carousel', function() {
                that.to(pos);
            });
        }
        if (activeIndex == pos) {
            return this.pause().cycle();
        }
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    };

    Carousel.prototype.pause = function (e) {
        if (!e ) {
            this.paused = true;
        }
        if (this.$element.find('.otkcarousel-item-next, .otkcarousel-item-prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.otkcarousel-item-active'),
            $next = next || $active[type](),
            isCycling = this.interval,
            direction = type == 'next' ? 'left' : 'right',
            fallback  = type == 'next' ? 'first' : 'last',
            that = this;

        if (!$next.length) {
            if (!this.options.wrap) {
                return;
            }
            $next = this.$element.find('.otkcarousel-item')[fallback]();
        }

        if ($next.hasClass('otkcarousel-item-active')) {
            return (this.sliding = false);
        }

        var e = $.Event('slide.otk.carousel', {
            relatedTarget: $next[0],
            direction: direction
        });

        this.$element.trigger(e);
        if (e.isDefaultPrevented()) {
            return;
        }
        this.sliding = true;

        if (isCycling) {
            this.pause();
        }

        if (this.$indicators.length) {
            this.$indicators.find('.otkcarousel-indicator-active').removeClass('otkcarousel-indicator-active');
            this.$element.one('slid.otk.carousel', function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('otkcarousel-indicator-active');
                }
            });
        }

        if ($.support.transition) {
            $next.addClass('otkcarousel-item-' + type);
            $next[0].offsetWidth; // jshint ignore:line
            $active.addClass('otkcarousel-item-' + direction);
            $next.addClass('otkcarousel-item-' + direction);
            $active
                .one($.support.transition.end, function () {
                    $next
                        .removeClass(['otkcarousel-item-' + type, 'otkcarousel-item-' + direction].join(' '))
                        .addClass('otkcarousel-item-active');
                    $active.removeClass(['otkcarousel-item-active', 'otkcarousel-item-' + direction].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid.otk.carousel');
                    }, 0);
                })
                .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
        } else {
            $active.removeClass('otkcarousel-item-active');
            $next.addClass('otkcarousel-item-active');
            this.sliding = false;
            this.$element.trigger('slid.otk.carousel');
        }

        if (isCycling) {
            this.cycle();
        }

        return this;
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkcarousel;

    $.fn.otkcarousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('otk.carousel'),
                options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action = typeof(option) == 'string' ? option : options.slide;

            if (!data) {
                $this.data('otk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof(option) == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.otkcarousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.otkcarousel.noConflict = function () {
        $.fn.otkcarousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
        var $this = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.otkcarousel(options);
        if ((slideIndex = $this.attr('data-slide-to'))) {
            $target.data('otk.carousel').to(slideIndex);
        }
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-ride="otkcarousel"]').each(function() {
            var $carousel = $(this);
            $carousel.otkcarousel($carousel.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: shoveler.js
 * http://docs.x.origin.com/OriginToolkit/#/carousels
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // SHOVELER CLASS DEFINITION
    // =========================

    var Shoveler = function (element, options) {

        this.$element = $(element);
        this.$indicators = this.$element.find('.otkshoveler-indicators');
        this.$items = this.$element.find('.otkshoveler-item');
        this.$leftControl = this.$element.find('.otkshoveler-control-left');
        this.$rightControl = this.$element.find('.otkshoveler-control-right');
        this.options = options;
        this.sliding = null;
        this.translateX = 0;

        var last = this.$items[this.$items.length - 1];
        this.end = last.offsetLeft + last.offsetWidth;

        if (this.end > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        }

        // toggle the controls on resize
        $(window).on('resize', $.proxy(this.onresize, this));

    };

    Shoveler.DEFAULTS = {};

    Shoveler.prototype.next = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('next');
    };

    Shoveler.prototype.prev = function() {
        if (this.sliding) {
            return;
        }
        return this.slide('prev');
    };

    Shoveler.prototype.slide = function(type) {

        var width = this.$element[0].offsetWidth,
            $items = this.$element.find('.otkshoveler-items');

        this.translateX += (type === 'next') ? -1 * width : width;

        this.$rightControl.removeClass('otkshoveler-control-disabled');
        this.$leftControl.removeClass('otkshoveler-control-disabled');

        if (this.translateX - width < -1 * this.end) {
            this.translateX = -1 * this.end + width - 2; //2 pixel margin
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }

        if (this.translateX > 0) {
            this.translateX = 0;
            this.$leftControl.addClass('otkshoveler-control-disabled');
        }

        $items.css({
            '-webkit-transform': 'translate3d(' + this.translateX + 'px, 0, 0)'
        });

    };

    Shoveler.prototype.onresize = function() {
        if (this.tid) {
            window.clearTimeout(this.tid);
        }
        this.tid = window.setTimeout($.proxy(this._onresize, this), 30);
    };

    Shoveler.prototype._onresize = function() {
        if (this.end + this.translateX > this.$element[0].offsetWidth) {
            this.$rightControl.removeClass('otkshoveler-control-disabled');
        } else {
            this.$rightControl.addClass('otkshoveler-control-disabled');
        }
    };


    // SHOVELER PLUGIN DEFINITION
    // ==========================

    var old = $.fn.otkshoveler;

    $.fn.otkshoveler = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.shoveler'),
                options = $.extend({}, Shoveler.DEFAULTS, $this.data(), typeof option == 'object' && option),
                action  = typeof option == 'string' ? option : options.shovel;
            if (!data) {
                $this.data('otk.shoveler', (data = new Shoveler(this, options)));
            }
            if (action) {
                data[action]();
            }
        });
    };

    $.fn.otkshoveler.Constructor = Shoveler;


    // SHOVELER NO CONFLICT
    // ====================

    $.fn.otkshoveler.noConflict = function() {
        $.fn.otkshoveler = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.otk.shoveler.data-api', '[data-shovel], [data-shovel-to]', function(e) {
        var $this   = $(this),
            href,
            $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
            options = $.extend({}, $target.data(), $this.data());
        $target.otkshoveler(options);
        e.preventDefault();
    });

    $(window).on('load', function () {
        $('[data-pickup="otkshoveler"]').each(function () {
            var $shoveler = $(this);
            $shoveler.otkshoveler($shoveler.data());
        });
    });

}(jQuery));

/* ========================================================================
 * OTK: modal.js
 * http://docs.x.origin.com/OriginToolkit/#/modals
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop =
        this.isShown = null;

        if (this.options.remote) {
            this.$element
                .find('.otkmodal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.otk.modal');
                }, this));
        }
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this,
            e = $.Event('show.otk.modal', { relatedTarget: _relatedTarget });

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) {
            return;
        }
        this.isShown = true;

        this.escape();

        this.$element.on('click.dismiss.otk.modal', '[data-dismiss="otkmodal"]', $.proxy(this.hide, this));

        this.backdrop(function() {
            var transition = $.support.transition;

            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body); // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0);

            if (transition) {
                that.$element[0].offsetWidth; // jshint ignore:line
            }

            that.$element
                .addClass('otkmodal-visible')
                .attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.otk.modal', { relatedTarget: _relatedTarget });

            if (transition) {
                that.$element.find('.otkmodal-dialog') // wait for modal to slide in
                    .one($.support.transition.end, function () {
                        that.$element.focus().trigger(e);
                    })
                    .emulateTransitionEnd(300);
            } else {
                that.$element.focus().trigger(e);
            }

        });
    };

    Modal.prototype.hide = function (e) {

        if (e) {
            e.preventDefault();
        }

        e = $.Event('hide.otk.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        this.escape();

        $(document).off('focusin.otk.modal');

        this.$element
            .removeClass('otkmodal-visible')//.removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.otk.modal');

        if ($.support.transition) {
            this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300);
        } else {
            this.hideModal();
        }

    };

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.otk.modal') // guard against infinite focus loop
            .on('focusin.otk.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.focus();
                }
            }, this));
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.otk.modal', $.proxy(function (e) {
                if (e.which == 27) {
                    this.hide();
                }
            }, this));
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.otk.modal');
        }
    };

    Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger('hidden.otk.modal');
        });
    };

    Modal.prototype.removeBackdrop = function() {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function(callback) {
        var animate = '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="otkmodal-backdrop ' + animate + '" />')
                .appendTo(document.body);

            this.$element.on('click.dismiss.otk.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if (this.options.backdrop == 'static') {
                    this.$element[0].focus.call(this.$element[0]);
                } else {
                    this.hide.call(this);
                }
            }, this));

            if (doAnimate) {
                this.$backdrop[0].offsetWidth; // jshint ignore:line
            }

            this.$backdrop.addClass('otkmodal-backdrop-visible');

            if (!callback) {
                return;
            }

            if (doAnimate) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (!this.isShown && this.$backdrop) {

            this.$backdrop.removeClass('otkmodal-backdrop-visible');

            if ($.support.transition) {
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150);
            } else {
                callback();
            }

        } else if (callback) {
            callback();
        }
    };


    // MODAL PLUGIN DEFINITION
    // =======================

    var old = $.fn.otkmodal;

    $.fn.otkmodal = function(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.modal'),
                options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('otk.modal', (data = new Modal(this, options)));
            }
            if (typeof(option) == 'string') {
                data[option](_relatedTarget);
            } else if (options.show) {
                data.show(_relatedTarget);
            }
        });
    };

    $.fn.otkmodal.Constructor = Modal;


    // MODAL NO CONFLICT
    // =================

    $.fn.otkmodal.noConflict = function() {
        $.fn.otkmodal = old;
        return this;
    };


    // MODAL DATA-API
    // ==============

    $(document).on('click.otk.modal.data-api', '[data-toggle="otkmodal"]', function (e) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
            option = $target.data('otk.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

        if ($this.is('a')) {
            e.preventDefault();
        }

        $target
            .otkmodal(option, this)
            .one('hide', function () {
                if ($this.is(':visible')) {
                    $this.focus();
                }
            });
    });

    $(document)
        .on('show.otk.modal', '.otkmodal', function () { $(document.body).addClass('otkmodal-open') })
        .on('hidden.otk.modal', '.otkmodal', function () { $(document.body).removeClass('otkmodal-open') });

}(jQuery));

/* ========================================================================
 * OTK: tooltip.js
 * http://docs.x.origin.com/OriginToolkit/#/tooltips
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type =
        this.options =
        this.enabled =
        this.timeout =
        this.hoverState =
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="otktooltip"><div class="otktooltip-arrow"></div><div class="otktooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin',
                    eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }

        if (this.options.selector) {
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }));
        } else {
            this.fixTitle();
        }
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof(options.delay) == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {},
            defaults = this.getDefaults();

        if (this._options) {
            $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value;
                }
            });
        }

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) {
            return self.show();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') {
                self.show();
            }
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type);

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) {
            return self.hide();
        }

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') {
                self.hide();
            }
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.otk.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }
            var that = this;

            var $tip = this.tip();

            this.setContent();

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i,
                autoPlace = autoToken.test(placement);
            if (autoPlace) {
                placement = placement.replace(autoToken, '') || 'top';
            }

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass('otktooltip-' + placement);

            if (this.options.container) {
                $tip.appendTo(this.options.container);
            } else {
                $tip.insertAfter(this.$element);
            }

            var pos = this.getPosition(),
                actualWidth = $tip[0].offsetWidth,
                actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var $parent = this.$element.parent(),
                    orgPlacement = placement,
                    docScroll = document.documentElement.scrollTop || document.body.scrollTop,
                    parentWidth = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth(),
                    parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight(),
                    parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                                        placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                                        placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                        placement;

                $tip
                    .removeClass('otktooltip-' + orgPlacement)
                    .addClass('otktooltip-' + placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.$element.trigger('shown.otk.' + that.type);
            };

            if ($.support.transition) {
                $tip
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace,
            $tip = this.tip(),
            width = $tip[0].offsetWidth,
            height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10),
            marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) {
            marginTop = 0;
        }
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }

        offset.top  = offset.top  + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0);

        $tip.addClass('otktooltip-visible');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight;
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0;

            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;

                $tip.offset(offset);

                actualWidth  = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top');
        }

        if (replace) {
            $tip.offset(offset);
        }
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip(),
            title = this.getTitle();

        $tip.find('.otktooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('otktooltip-visible otktooltip-top otktooltip-bottom otktooltip-left otktooltip-right');
    };

    Tooltip.prototype.hide = function () {
        var that = this,
            $tip = this.tip(),
            e = $.Event('hide.otk.' + this.type);

        function complete() {
            if (that.hoverState != 'in') {
                $tip.detach();
            }
            that.$element.trigger('hidden.otk.' + that.type);
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) {
            return;
        }

        $tip.removeClass('otktooltip-visible');

        if ($.support.transition) {
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150);
        } else {
            complete();
        }

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                     placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   };
    };

    Tooltip.prototype.getTitle = function () {
        var title,
            $e = this.$element,
            o  = this.options;

        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);

        return title;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.otktooltip-arrow'));
    };

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options  = null;
        }
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget).otktooltip(this.getDelegateOptions()).data('otk.' + this.type) : this;
        if (self.tip().hasClass('otktooltip-visible')) {
            self.leave(self);
        } else {
            self.enter(self);
        }
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.timeout);
        this.hide().$element.off('.' + this.type).removeData('otk.' + this.type);
    };


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    var old = $.fn.otktooltip;

    $.fn.otktooltip = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.tooltip'),
                options = typeof(option) == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                $this.data('otk.tooltip', (data = new Tooltip(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.otktooltip.Constructor = Tooltip;


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.otktooltip.noConflict = function () {
        $.fn.otktooltip = old;
        return this;
    };

}(jQuery));

/* ========================================================================
 * OTK: inputs.js
 * http://docs.x.origin.com/OriginToolkit/#/forms
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */

(function($) {
    'use strict';

    var CLS_FORMGROUP = 'otkform-group',
        CLS_ERROR = 'otkform-group-haserror',
        CLS_SUCCESS = 'otkform-group-hassuccess';


    /**
    * Remove the class name from erroneous inputs on focus
    * @param {Event} e
    * @return {void}
    * @method removeClass
    */
    function removeClass(e) {
        var targ = e.target,
            parent = targ.parentNode,
            $group = parent && $(parent.parentNode);
        if ($group && $group.hasClass(CLS_FORMGROUP)) {
            $group.removeClass(CLS_ERROR);
            $group.removeClass(CLS_SUCCESS);
        }
    }

    /**
    * Update a select when you change the value
    * @param {Event} e
    * @return {void}
    * @method updateSelect
    */
    function updateSelect(e) {
        var select = e.target,
            text = $(select.options[select.selectedIndex]).text(),
            label = $(select.parentNode).find('.otkselect-label');
        label.text(text);
    }


    // this could have potential performance problems so we have
    // to be careful here.
    $(document)
        .on('focus.otk', '.otkfield', removeClass)
        .on('change.otk', '.otkselect select', updateSelect);

}(jQuery));

/* ========================================================================
 * OTK: pillsnav.js
 * http://docs.x.origin.com/OriginToolkit/#/nav
 * ========================================================================
 * Copyright 2014 Electronic Arts Inc.
 * ======================================================================== */


(function($) {
    'use strict';


    // Constants
    // =========================
    var CLS_PILLACTIVE = 'otkpill-active',
        CLS_NAVPILLS = 'otknav-pills',
        CLS_NAVBAR_STICKY = 'otknavbar-issticky',
        CLS_NAVBAR_STUCK = 'otknavbar-isstuck',
        pilltoggle = '[data-drop="otkpills"]';


    // PILLSNAV CLASS DEFINITION
    // =========================
    var PillsNav = function(element, options) {

        var $element = $(element);
        this.$element = $element;
        this.$nav = $element.find('.' + CLS_NAVPILLS);
        this.options = options;

        if (typeof this.options.stickto !== 'undefined') {
            if (!this.$bar) {
                this.initBar();
            }

            // the parent must be an offset parent
            var $parent = this.options.stickto !== '' ? $(this.options.stickto) : null,
                elm = this.$element[0].offsetParent, // we don't care about the first 69px
                top = 0;

            while ((elm && !$parent) || (elm && $parent && elm !== $parent[0])) {
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }

            this.top = top;
            this.$element.addClass(CLS_NAVBAR_STICKY);
            this.$element.css({'top': (this.options.offsetTop || 0) + 'px'});

            if (this.options.stickto !== "") {
                $(this.options.stickto).scroll($.proxy(this.onscroll, this));
            } else {
                $(document).scroll($.proxy(this.onscroll, this));
            }
        }
    };

    // default configuration
    PillsNav.DEFAULTS = {
        template: '<div class="otknav-pills-bar"></div>'
    };

    PillsNav.prototype.toggle = function(e) {
        if (!this.$bar) {
            this.initBar();
        }
        var $elm = $(e.target).parent(),
            width = $elm.width(),
            left = $elm.position().left,
            $bar;
        $bar = this.bar();
        $bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });
    };

    PillsNav.prototype.initBar = function() {
        var $active = this.$element.find('.' + CLS_PILLACTIVE),
            bar = this.bar(),
            width = $active.width(),
            left = $active.position().left;

        bar.css({
            'width': width + 'px',
            'transform': 'translate3d(' + left + 'px, 0, 0)'
        });

        this.$element.append(bar);
        $active.removeClass(CLS_PILLACTIVE);
    };

    PillsNav.prototype.bar = function () {
        return (this.$bar = this.$bar || $(this.options.template));
    };

    PillsNav.prototype.onscroll = function() {
        var top = $(document).scrollTop();
        if (top >= this.top) {
            this.$element.addClass(CLS_NAVBAR_STUCK);
        } else {
            this.$element.removeClass(CLS_NAVBAR_STUCK);
        }
    };


    // PILLSNAV PLUGIN DEFINITION
    // ==============================

    // this is still up for debate, if this should be dropdown
    // or prefixed with otk dropdown
    var old = $.fn.otkpillsnav;

    $.fn.otkpillsnav = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('otk.pillsnav'),
                options = $.extend({}, PillsNav.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('otk.pillsnav', (data = new PillsNav(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call(data);
            }
        });
    };

    $.fn.otkpillsnav.Constructor = PillsNav;


    // PROGRESSBAR NO CONFLICT
    // ========================

    $.fn.otkpillsnav.noConflict = function () {
        $.fn.otkpillsnav = old;
        return this;
    };


    // APPLY TO STANDARD PROGRESSBAR ELEMENTS
    // =======================================

    $(document)
        .on('click.otk.pillsnav.data-api', pilltoggle, function(e) {
            var $this = $(this),
                pillsNav = $this.data('otk.pillsnav');
            if (!pillsNav) {
                $this.otkpillsnav($.extend({}, $this.data()));
                pillsNav = $this.data('otk.pillsnav'); // there must be a better way to do this
            }
            pillsNav.toggle(e);
            e.preventDefault();
        });


}(jQuery));
