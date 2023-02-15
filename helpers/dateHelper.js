const express = require("express");
const getDate = function getDate() {
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    return(today.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long"
    }));
};

module.exports = getDate;