---
author: Tim Keiner
date: '2017-03-28'
tags:
- javascript
title: Angular, we have to talk!
---

About three or four years ago I had the first contact with AngularJs (obviously V1.x) and what should I say? I loved it! It perfectly  added the missing piece that JQuery wasnt able to solve: Bind data to the Dom in an easy way. Since this days there where a lot of evolution in Javascriptland. A lot of new Frameworks for entire SPAs, new techniques like functional and reactive programming, a lot (!) of build systems / task manager and even the language itself developed towards an serious programming language (I know some  people have a different opinion). At least with the power of Typescript (or Flow) Javascript projects doenst have to be a Pain. Angular2+ took many of the the mordern aspects to provide a good and productive developer experience to develop application in time, quality and budget. Dont get me wrong: They made a very good job! But I have personally some concerns which I want to point out in this post.

<!--more-->

## E=mc<sup>2</sup>

As I said, I worked with Angular1 and also had the chance to work with Vue.js and React. The first and most obvious difference are the lines of code. Creating a component - doesn't matter how simple - requires a bunch of code. Lets think about a tiny component for a Bootstrap form-group

bootstrap-form-group.html:

    <div class="form-group">
        <div class="col-sm-2">
            <label for="fancy-id">Name</label>
        </div>
        <div class="col-sm-12">
            <input type="text" class="form-control" id="fancy-id" placeholder="Jane Doe">
        </div>
    </div>


In a larger form we have to copy/paste these snippet a lot... or make use of the cool new component world and create a componente like this:

bootstrap-form-group-component.html:

    <form-group label="Name" forId="fancy-id">
    <input type="text" class="form-control" id="fancy-id" placeholder="Jane Doe">
    </form-group>

We wrap the html boilerplate code within a small component. The component should not execute any logic and doesnt have any relevant state or events. Easily said it is just a template with defined inputs. In Angular it would look like this:

form-group.component.ts:

    import {Component, Input} from '@angular/core';

    @Component({
        selector: 'form-group',
        template: `
            <div class="form-group">
                <div class="col-sm-2">
                    <label [attr.for]="forId">{{label}}</label>
                </div>
                <div class="col-sm-12">
                    <ng-content></ng-content>
                </div>
            </div>
        `
    })
    export class FormGroupComponent {
        @Input() lable:string;
        @Input() forId:string;
    }

Ok you see 9 lines of code (the html is considered as one, whitespaces are omitted). You also need to register the component in a module -> Two lines more (importing the component and adding the component). Which also creates more complexity and dependencies.

In contrast to this React (for example) has the concept of Statelss Components. Stateless Components are just pure functions which return a jsx component.

form-group.jsx:

    export const FormGroup = (props) => (
            <div className="form-group">
                <div className="col-sm-2">
                    <label htmlFor={props.forId}>{props.label}</label>
                </div>
                <div className="col-sm-12">
                        {props.children}
                </div>
            </div>
    );


If we also doesnt count the markup here, we end up with **one** line (depending on your setup you need to import react, so consider two lines). Thats it. No registering into a module System or something else. So we come to the next point.

## Modules, Modules Modules

The idea behind modules is a good one at the first glance. It provides clear encapsulation, seperation and all these stuff large projects needs. But to be honest: Why so complicated? There are imports, exports, declarations and providers and as a developer I need to now how they work and what the supposed to do. Even in a small project, even when I just started and want to build small things with Angular. But my main concern is: Even in large Projects, I'm not sure if these module thing is really useful at all? Especally with Typescript we got ES6-Modules which in fact solves many problems with importings / exporting values, creating scopes, encapsulation and so on. So therefore it is not useful (in my opinion).

A good argument is obviously the need of something like a module strucutre when we talk about [DI](https://angular.io/docs/ts/latest/guide/dependency-injection.html#!#why-di). The new DI System in Angular2+ looks really clean and well-thought-out. I never had a real _deep dive_ into the DI module itself but the [slides and talks](https://pascalprecht.github.io/slides/di-in-angular-2) I saw so far looked pretty straight forward. Thats the reason why I'm curios about it: Why does DI looks so easy and the module-system so complicated - or at least overwhelming (and I worked with Spring and JEE, so I know something about DI-Systems ;))?

## Forms

Ok this topic is defficult for me. I like the [forms and reactive forms module](http://learnangular2.com/forms/) and it's basic concepts on the other hand it's like so many other parts of Angular2: It feels kind of over engineered. You need tp learn a lot if you start with Angular2+ Forms. Form-groups and there DSL, Validators, ValueAccessors, etc. even if all of them are more or less easy to understand it were a lot of concepts you need to add to your skill set. And then there are two major concerns to my about Form:

### Formbuilder

It is a cool idea to create such complex objects like forms with a builder class - no concern. But if you look a the typings of the form builder, than you'll find out: There is no real typing at all.

FormBuilder.ts:

    interface FormBuilder {
    /* ... */
    group(controlsConfig: {[key: string]: any}, extra?: {[key: string]: any}) : FormGroup
    /* ... */
    }

Controls config is a key - value pair where the value is a type of _any_. Really? As far as I worked with this builder it was a array triple of string, Validator and Asynvalidator which would look so:

FormBuilderControlConfig.ts:

    type FormBuilderControlConfig = [any, ValidatroFn, AsyncValidatorFn];


It was not possible to apply any other Data to this array. Or is it?

### Validator Errors

Maybe this is a question of personal preferences but i dont like, that a validation function also return key - value map with _any_ as value type. On the one hand it gives developers the possibility to attach complex error messages to it's validations on the other hand you have to figure out the shape of the returned validation by yourself if you use third-party validators.

## Dynamic Components

It was a mess to create dynamic outlet components in Angular2 so far (e.g. for dynamic list of different Cards). But I'll not talk about  it since it [seems they have a solution with the next major release](https://netbasal.com/a-taste-from-angular-version-4-50be1c4f3550) :)

## Summary

To be clear: this should not be a rant about Angular2+. It's still a very major and impressive technology and I could make an even longer Post about the good parts. But some things concerned me in my projects which a wanted to share. Maybe some of this points will be solved in feature relaeses, maybe not. Maybe I'll find ways to work more efficient with it. But in the end: In all Frameworks you'll have disadvantages. The Major concern in Angular2: You have to learn a lot of new stuff.