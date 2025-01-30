const express = require('express');
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.json());


async function handlePRAction(action, pr) {
    const prAuthor = pr.user.login;
    const prTitle = pr.title;
    const prUrl = pr.html_url;
    const prNumber = pr.number;
    const prMerged = pr.merged;

    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (action === 'opened') {
        console.log(`PR #${prNumber} opened by ${prAuthor}. Title: ${prTitle}. URL: ${prUrl}`);
    } else if (action === 'closed' && prMerged) {
        console.log(`PR #${prNumber} merged by ${prAuthor}. Title: ${prTitle}. URL: ${prUrl}`);
    } else if (action === 'closed' && !prMerged) {
        console.log(`PR #${prNumber} closed by ${prAuthor}. Title: ${prTitle}. URL: ${prUrl}`);
    } else if (action === 'reopened') {
        console.log(`PR #${prNumber} reopened by ${prAuthor}. Title: ${prTitle}. URL: ${prUrl}`);
    }
}

app.post('/github-webhook', async (req, res) => {
    const event = req.headers['x-github-event'];
    await console.log(event)
    const payload = req.body;
    await console.log(payload.commits)

    if (event === 'pull_request') {
        const prAction = payload.action;
        const pr = payload.pull_request;
        
        try {
            await handlePRAction(prAction, pr);
            res.status(200).send('Webhook processed successfully');
        } catch (error) {
            console.error('Error processing PR:', error);
            res.status(500).send('Failed to process the PR event');
        }
    } else {
        res.status(200).send('Non-PR event ignored');
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
