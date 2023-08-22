// --= OPTIONS =--
const FORUM_CHANNEL_TYPE_ENUM = 15;
const CHANNEL_MAX_TAGS = 5; // discord's limit, please don't change this :C

let suggestionChannels = ["1078194360031641670"]; // list of id of channels--eventually migrate this into a command so channels can be added and remove through discord

let tagsToApplyOnNewSuggestion = ["Awaiting Response"]; // tags that will be applied when the message is sent
let tagsToIgnoreOnNewSuggestion = ["Approved", "Denied", "Implemented"]; // if the message has any of these tags, don't create a new suggestion

/* 
    if a channel can't have any more tags due to discord's limit, should tags be removed from the channel first?
    the amount of tags that will be removed is exactly the amount of tags defined in the 'tagsToApplyOnNewSuggestion' list
    tags that were applied to the channel first will be removed before tags that were applied to the channel last
*/
let removeTagIfLimitIsReached = true; 

// --= END SECTION =--


/* 
    channel = channel object
    tags[] = array of tag IDs to be removed from the channel
*/
function removeTagsInChannel(channel, tags = []){
    // iterate over all tags applied to the channel
    let channelTags = channel.appliedTags;
    for (let tag of tags){
        // check if the channel has tag to be removed
        let channelHasTag = channelTags.includes(tag);
        if (!channelHasTag)
            continue;
            
        channelTags.splice(channelTags.indexOf(tag), 1)
    }

    channel.setAppliedTags(channelTags);
}

/* 
    channel = channel object
    tags[] = array of tag IDs to be added to the channel
*/
function addTagsToChannel(channel, tags = []) {
    // iterate over all tags that should be applied to the channel
    let channelTags = channel.appliedTags;
    for (let tag of tags) {

        // check if the channel has the max number of tags possible
        let channelHasMaxAmountTags = channelTags.length >= CHANNEL_MAX_TAGS;
        if (channelHasMaxAmountTags) {

            // check if tags can be removed in case the channel has maximum amount of tags allowed (defined in the options section, towards the beginning of this file)
            if (!removeTagIfLimitIsReached) break;

            let removeTags = [];
            let channelFirstTag = channelTags[0];
            removeTags.push(channelFirstTag);

            removeTagsInChannel(channel, removeTags);
        }

        // check if channel already has the tag to be added
        let channelHasTag = channelTags.includes(tag);
        if (channelHasTag)
            continue;
        
        channelTags.push(tag);
    }

    console.log("Channel tags: " + channelTags);

    channel.setAppliedTags(channelTags);

    console.log("Applied tags to channel");
}

function findTagsInForumByName(forum, tags = []){
    let forumAvailableTags = forum.availableTags;
    let results = [];

    for (let forumTag of forumAvailableTags) {
        for (let tag of tags) {
            // check if name of the tag of the forum matches the name of the given tag
            let forumHasTag = forumTag.name === tag;
            if (!forumHasTag) break;

            results.push(forumTag.id);
        }
    }

    return results;
}

function threadChannelHasTags(channel, tags){
    console.log("Thread tags: " + channel.appliedTags);
    for (let tag of tags){
        // check if the channel has the tag applied to it
        let channelHasTag = channel.appliedTags.includes(tag);
        console.log("Current tag: " + tag);
        console.log("Channel has tag: " + channel.appliedTags.includes(tag));
        if (channelHasTag);
            return true;
    }

    return false;
}

/* 
    when a message is created, execute this function
*/
exports.onNewSuggestion = (client, msg) => {
        // check if bot is the author of the message
        let botIsMsgAuthor = msg.author.id === client.user.id
        if (botIsMsgAuthor) return;

        // check if message was sent in a thread
        let msgChannelIsThread = msg.channel.isThread()
        if (!msgChannelIsThread) return;

        console.log("channel is thread");

        // check if the parent channel of the thread channel is a forum
        let parentChannelIsForum = msg.channel.parent.type == FORUM_CHANNEL_TYPE_ENUM;
        if (!parentChannelIsForum) return;

        console.log("parent channel is forum");

        // check if the channel the message was sent into is part of the list of suggestion channels
        let channelIsSuggestionChannel = suggestionChannels.includes(msg.channel.parent.id);
        if (!channelIsSuggestionChannel) return;

        console.log("thread is suggestion channel");

        let forumChannel = msg.channel.parent;
        let tagsToApplyById = findTagsInForumByName(forumChannel, tagsToApplyOnNewSuggestion);
        let ignoreMessagesWithTagsById = findTagsInForumByName(forumChannel, tagsToIgnoreOnNewSuggestion);

        console.log("Tags to be applied: " + tagsToApplyById);
        console.log("Tags to be ignored: " + ignoreMessagesWithTagsById);

        // check if thread channel has any tags that are being ignored
        let channelHasIgnoredTags = threadChannelHasTags(msg.channel, ignoreMessagesWithTagsById);
        if (channelHasIgnoredTags)
            return;

        console.log("channel doesn't have ignored tags");

        addTagsToChannel(msg.channel, tagsToApplyById);
}

/* 
    when a user makes changes to a thread channel (rename, add/remove tags, etc.), execute this function
*/
exports.resolveSuggestion = (client, Events) =>{
    client.on(Events.ThreadUpdate, async (oldChannel, newChannel) =>{
        // check if tags were added to the channel
        let addedTags = newChannel.appliedTags.filter(tag => oldChannel.appliedTags.includes(tag));
        let tagsWereAdded = addedtags.length > 0;
        if (!tagsWereAdded) return;

        // Get audit log, specifically last user who edited a forum thread
        let user = await newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 }).entries.first().executor.id;

        // check if bot edited the channel
        let botEditedChannel = user == client.user.id;
        if (botEditedChannel)
            return;

        // Define tag maps
        let forumTagsByName = new Map();
        let forumTagsById = new Map();
        newChannel.parent.availableTags.forEach(availableTag =>{
            forumTagsByName.set(availableTag.name, availableTag.id);
            forumTagsById.set(availableTag.id, availableTag.name);
        });

        // Set message and remove tags depending on which tags were added
        let message = "";
        let removeTags = [];
        let error;
        addedTags.forEach(addedTag =>{
            switch (forumTagsById.get(addedTag)){
                case "Approved":
                    message = "approved";
                    break;
                case "Denied":
                    message = "denied";
                    break;
                case "Implemented":
                    message = "implemented";
                    if (newChannel.appliedTags.includes(forumTagsByName.get("Approved"))) removeTags.push(forumTagsByName.get("Approved"));
                    if (newChannel.appliedTags.includes(forumTagsByName.get("Denied"))) removeTags.push(forumTagsByName.get("Denied"));
                    break;
                default:
                    error = true;
                    break;
            }
        });

        if (error === true) return;
        removeTags.push(forumTagsByName.get("Awaiting Response"));
        
        // Remove tags
        removeTagsInChannel(newChannel, removeTags);

        // Send message and close post
        let owner = await newChannel.fetchOwner();
        let msg = `Hello <@${owner.id}>! This suggestion has been ${message} by <@${user}>! If you have any questions regarding the decision, please contact <@${user}>. This post has been locked and closed.`;
        let sentMessage = await newChannel.send(msg);
        
        newChannel.setLocked(true);
        newChannel.setArchived(true);
    });
}