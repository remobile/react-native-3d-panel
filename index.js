'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    StyleSheet,
    View,
    Animated,
    PanResponder,
    Dimensions,
} = ReactNative;

module.exports = React.createClass({
    getDefaultProps() {
        return {
            speed: 500,
            menuWidth: Dimensions.get('window').width * 2 / 3,
        };
    },
    componentWillMount() {
        this.lastGestureDx = null;
        this.translateX = 0;
        this.animatedRotate = new Animated.Value(0);
        this.animatedTranslateX = new Animated.Value(0);
        this.directionRight = false;

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderTerminationRequest: (evt, gestureState) => false,

            onPanResponderGrant: (evt, gestureState) => {
                this.lastGestureDx = null;
            },
            onPanResponderMove: (evt, gestureState) => {
                const {menuWidth} = this.props;
                const {changedTouches} = evt.nativeEvent;
                if (changedTouches.length <= 1 && !this.animating) {
                    this.translateX += (this.lastGestureDx === null) ? 0 : gestureState.dx - this.lastGestureDx;
                    if (this.translateX < 0) {
                        this.translateX = 0;
                    }
                    if (this.translateX > menuWidth) {
                        this.translateX = menuWidth;
                    }
                    this.directionRight = (this.translateX > menuWidth * 3 / 4) ? true : (this.translateX < menuWidth / 4) ? false : gestureState.dx - this.lastGestureDx > 0;
                    this.lastGestureDx = gestureState.dx;
                    this.animatedRotate.setValue(-this.translateX);
                    this.animatedTranslateX.setValue(this.translateX);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (this.lastGestureDx && !this.animating) {
                    if (this.directionRight) {
                        this.repositionToRight();
                    } else {
                        this.repositionToLeft();
                    }
                }
            },
            onPanResponderTerminate: (evt, gestureState)=> {}
        });
    },
    repositionToLeft() {
        const {speed, menuWidth} = this.props;
        const time = (this.translateX / menuWidth) * speed;
        this.animating = true;
        Animated.parallel([
            Animated.timing(this.animatedRotate, {
                toValue: 0,
                duration: time,
            }),
            Animated.timing(this.animatedTranslateX, {
                toValue: 0,
                duration: time,
            })
        ]).start(()=>{
            this.animating = false;
            this.translateX = 0;
        });
    },
    repositionToRight() {
        const {speed, menuWidth} = this.props;
        const time = speed - (this.translateX / menuWidth) * speed;
        this.animating = true;
        Animated.parallel([
            Animated.timing(this.animatedRotate, {
                toValue: -menuWidth,
                duration: time,
            }),
            Animated.timing(this.animatedTranslateX, {
                toValue: menuWidth,
                duration: time,
            })
        ]).start(()=>{
            this.animating = false;
            this.translateX = menuWidth;
        });
    },
    render() {
        const {menuWidth, style} = this.props;
        const animatedTranslateXStyle = {
            transform: [{
                translateX: this.animatedTranslateX,
            }]
        };
        const animatedInnerTranslateXStyle = {
            transform: [{
                translateX: this.animatedTranslateX.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, app.isandroid?0.7:0.8]
                }),
            }]
        };
        const animatedRotateStyle = {
            transform: [
                {perspective: sr.tw},
                {rotateY: this.animatedRotate.interpolate({
                    inputRange: [-1, 0],
                    outputRange: ['-0.12deg', '0deg'],
                }),
            }]
        };
        return (
            <View style={[styles.container, style]} {...this.panResponder.panHandlers}>
                <Animated.View style={[{flex: 1, width: menuWidth, position: 'absolute', left: -menuWidth, top: 0}, animatedTranslateXStyle]}>
                    {this.props.leftMenu}
                </Animated.View>
                <Animated.View style={[{flex: 1}, animatedInnerTranslateXStyle]}>
                    <Animated.View style={[{flex: 1}, animatedRotateStyle]}>
                        {this.props.children}
                    </Animated.View>
                </Animated.View>
            </View>
        )
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
