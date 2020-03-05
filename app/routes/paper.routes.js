module.exports = (app) => {
    const papers = require('../controllers/paper.controller.js');

    //Create new paper
    app.post('/papers', papers.create);

    //Retrieve a paper
    app.get('/papers:id', papers.findOne);

    //Retrieve all papers
    app.get('/papers', papers.findAll);

    //Update a paper
    app.put('/papers:id', papers.update);

    //Delete a paper
    app.delete('/papers:id', papers.delete);

}
