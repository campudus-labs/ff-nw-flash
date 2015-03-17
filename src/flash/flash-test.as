stop();

import mx.transitions.Tween;
import mx.transitions.easing.*;
import flash.external.ExternalInterface;

var tween = new Tween(someTextClip, "_alpha", Regular.easeOut, 0, 100, 1, true);
tween.onMotionFinished = function() {
  this.yoyo();
};

someTextClip.textInput.text = 'test4';

ExternalInterface.addCallback('callFlashFunction', null, yourFlashFunction);
ExternalInterface.call('onFlashLoaded', true);

function yourFlashFunction (arg1) {
  someTextClip.textInput.text = arg1;
}
