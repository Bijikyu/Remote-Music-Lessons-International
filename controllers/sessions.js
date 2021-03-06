const Session = require('../models/session');
const Assignment = require('../models/assignment');
const User = require('../models/user');


function create(req, res){ 
    if (req.user.instructor === false) {
        req.body.createdBy = req.user._id;
        req.body.student = req.user.name;
        Session.create(req.body, function(err) {
            if (err) return res.redirect('/sessions/new');
            res.redirect('/sessions');
        })
    } 
    else {
        User.findById(req.body.createdBy)
        .populate('users').exec(function(err, user){
            req.body.instructor = req.user.name;
            req.body.student = user.name;
            Session.create(req.body, function(err) {
                if (err) return res.redirect('/sessions/new');
                res.redirect('/sessions');
            })
        })
    }; 
}

function deleteSession(req, res) {
    Session.findById(req.params.id, function(err, session) {
        if (!session.createdBy.equals(req.user._id) && req.user.instructor === false){
            res.redirect('/sessions');
        }
        else {
            Session.findByIdAndDelete(req.params.id, function(err){
                res.redirect('/sessions');
            });
        }
    })
}

function edit(req, res) {
    Session.findById(req.params.id)
    .populate('assignments').exec(function(err, session){
        Assignment.find({_id: {$nin: session.assignments}})
        .exec(function(err, assignments){
            if (req.user) {
                if(!session.createdBy.equals(req.user._id) && req.user.instructor === false){
                    return res.redirect('/sessions');
                }
                else {
                    if (err) return res.redirect('/sessions');
                    console.log(session);
                    res.render('sessions/edit', { session, assignments});
                }
            } else {
                return res.redirect('/sessions');
            }
        })
    });
}

function index(req, res) {
    if(!req.user){
        res.redirect('/');
    }
    else{
        Session.find({}, function(err, sessions) {
            res.render('sessions/index', { sessions });
        });
    }
}

function newSession(req,res){
    if(!req.user){
        res.redirect('/');
    }
    else {
        User.find({ instructor: false}, function(err, users) {
            res.render('sessions/new', { student: users });
        });
    }  
}

function show(req, res) {
    Session.findById(req.params.id)
    .populate('assignments')
    .exec(
    function(err, session){
        if (err) return res.redirect('/sessions');
        res.render('sessions/show', { session });
    });
}

function update(req, res) {
    if (req.user.instructor === true) req.body.instructor = req.user.name;
    Session.findByIdAndUpdate(req.params.id, req.body, function(err, session){
        res.redirect(`/sessions/${req.params.id}`); 
    });
}

module.exports = {
    index,
    new: newSession,
    create,
    show,
    delete: deleteSession,
    edit,
    update
};