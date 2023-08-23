// --= OPTIONS =--
const FORUM_CHANNEL_TYPE_ENUM = 15;
const CHANNEL_MAX_TAGS = 5; // discord's limit, please don't change this :C

let suggestionChannels = ["1078194360031641670"]; // list of id of channels--eventually migrate this into a command so channels can be added and remove through discord

let tagsToApplyOnNewSuggestion = ["Awaiting Response"]; // tags that will be applied when the message is sent
let tagsToIgnoreOnNewSuggestion = ["Approved", "Denied", "Implemented"]; // if the message has any of these tags, don't create a new suggestion

/*  if a channel can't have any more tags due to discord's limit, should tags be removed from the channel first?
    the amount of tags that will be removed is exactly the amount of tags defined in the 'tagsToApplyOnNewSuggestion' list
    tags that were applied to the channel first will be removed before tags that were applied to the channel last   */
let removeTagIfLimitIsReached = true; 

let tagsToRemoveOnResolveSuggestion = ["Awaiting Response"]; // list of tags that will be removed when a suggestion is resolved (do not include tags that resolve suggestions -> "Approved", etc.)

/*  name = name of the tag (must be equal to the one on the forum)
    tagsToRemove = array of tags (names) that will be removed from the thread when this tag is added (e.g. `{name: "Approved", tagsToRemove: ["Denied"]}` means the tag "Denied" would be removed if the tag "Approved" were added to the thread)
    the variable `tagsToRemoveOnResolveSuggestion` ensures that all tags listed are removed when a suggestion is resolved   */
const resolveSuggestionTags = [
    {name: "Approved", tagsToRemove: ["Denied", "Implemented"]},
    {name: "Denied", tagsToRemove: ["Implemented", "Approved"]},
    {name: "Implemented", tagsToRemove: ["Denied", "Approved"]},
];

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

    channel.setAppliedTags(channelTags);
}

/* 
    forum = channel object
    tags[] = array of tag names; will try to find tag IDs from the forum that match these

    returns = array of tag IDs that match the name of given tags
*/
function findTagsInForumByName(forum, tags = []){
    let forumAvailableTags = forum.availableTags;
    let results = [];

    for (let forumTag of forumAvailableTags) {
        for (let tag of tags) {
            // check if name of the tag of the forum matches the name of the given tag
            let forumHasTag = forumTag.name === tag;
            if (!forumHasTag) continue;

            results.push(forumTag.id);
        }
    }

    return results;
}

/* 
    channel = channel object
    tags[] = array of tag IDs; will check if the channel has any of these

    returns = true or false
*/
function threadChannelHasTags(channel, tags){
    for (let tag of tags){
        // check if the channel has the tag applied to it
        let channelHasTag = channel.appliedTags.includes(tag);
        if (channelHasTag)
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

    // check if the parent channel of the thread channel is a forum
    let parentChannelIsForum = msg.channel.parent.type == FORUM_CHANNEL_TYPE_ENUM;
    if (!parentChannelIsForum) return;

    // check if the channel the message was sent into is part of the list of suggestion channels
    let channelIsSuggestionChannel = suggestionChannels.includes(msg.channel.parent.id);
    if (!channelIsSuggestionChannel) return;

    let forumChannel = msg.channel.parent;
    let tagsToApplyById = findTagsInForumByName(forumChannel, tagsToApplyOnNewSuggestion);
    let ignoreMessagesWithTagsById = findTagsInForumByName(forumChannel, tagsToIgnoreOnNewSuggestion);

    // check if thread channel has any tags that are being ignored
    let channelHasIgnoredTags = threadChannelHasTags(msg.channel, ignoreMessagesWithTagsById);
    if (channelHasIgnoredTags)
        return;

    addTagsToChannel(msg.channel, tagsToApplyById);
}

/* 
    when a user makes changes to a thread channel (rename, add/remove tags, etc.), execute this function
*/
exports.resolveSuggestion = (client, Events) =>{
    client.on(Events.ThreadUpdate, async (oldChannel, channel) =>{
        // check if tags were added to the channel
        let addedTags = channel.appliedTags.filter(tag => !oldChannel.appliedTags.includes(tag));
        let tagsWereAdded = addedTags.length > 0;
        if (!tagsWereAdded) return;

        let forumChannel = channel.parent;
        let addedTagName = forumChannel.availableTags.filter(tag => tag.id === addedTags[0])[0].name;

        // check if added tag can resolve a suggestion (e.g. if the tag added is "Bending", it can't resolve a suggestion)
        let tagCanResolveSuggestion = resolveSuggestionTags.filter(tag => tag.name === addedTagName).length > 0;
        if (!tagCanResolveSuggestion) return;

        // check if the channel is part of the list of suggestion channels
        let channelIsSuggestionChannel = suggestionChannels.includes(channel.parent.id);
        if (!channelIsSuggestionChannel) return;

        // Get audit log, specifically last user who edited a forum thread
        let audit = await channel.guild.fetchAuditLogs({ type: 111, limit: 1 });
        let user = audit.entries.first().executor;

        // check if bot edited the channel
        let botEditedChannel = user.id == client.user.id;
        if (botEditedChannel)
            return;

        // Remove tags
        let removeTags = findTagsInForumByName(forumChannel, tagsToRemoveOnResolveSuggestion);
        
        let decisionTag = resolveSuggestionTags.filter(tag => tag.name === addedTagName)[0];
        let decisionTagsToRemove = findTagsInForumByName(forumChannel, decisionTag.tagsToRemove);

        removeTags.concat(decisionTagsToRemove);
        
        removeTagsInChannel(channel, removeTags);

        // Send message and close post
        let owner = await channel.fetchOwner();
        let message = `Hello <@${owner.id}>! This suggestion has been ${decisionTag.name} by <@${user.id}>! If you have any questions regarding the decision, please contact <@${user.id}>. This post has been locked and closed.`;
        
        await channel.send(message);
        
        channel.setLocked(true);
        channel.setArchived(true);
    });
}