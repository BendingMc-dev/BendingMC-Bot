
/*
    If a message is sent and the channel doesn't have the awaiting response tag AND doesn't have denied/approved/implemented tags, apply the tag

    If a suggestion is denied or approved, remove awaiting response tag if applicable

    If a suggestion is implemented remove denied and approved tags, if applicable


    TODO
    - Instead of using forumTags to store addedTags id, what if you reassigned the addedTags with the id? (not sure how this works)
    - Function get id of tag
*/

function updateTags(channel, addTags = [], removeTags = []){
    let updatedTags = channel.appliedTags;
    let removedTags;
    addTags.forEach(addTag =>{
        if (!channel.appliedTags.includes(addTag)){
            updatedTags.push(addTag);
        }
    })
    removeTags.forEach(removeTag =>{
        if (channel.appliedTags.includes(removeTag)){
            // updatedTags.slice(updatedTags.indexOf(removeTag), (updatedTags.indexOf(removeTag) + 1));
            removedTags = updatedTags.filter(i => i !== removeTag);
            // console.error("FIXME: modules/suggestions.js: updateTags() -> remove tag from channel");
        }
    })
    updatedTags = removedTags;

    channel.setAppliedTags(updatedTags);
}

exports.newSuggestion = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        if (msg.author.id === client.user.id) return;
        if (!msg.channel.isThread()) return;

        let tagsToApply = ["Awaiting Response"];
        let blockTags = ["Approved", "Denied", "Implemented"];
        let channel = msg.channel;
        let threadTags = channel.appliedTags;
        let forumTags = channel.parent.availableTags;
        
        // Checks if forum has the tags tagsToApply[]
        let foundForumTags = [];
        let foundForumBlockTags = [];
        forumTags.forEach(forumTag => {
            tagsToApply.forEach(tagToApply =>{
                if (forumTag.name === tagToApply) foundForumTags.push(forumTag.id);
            })
            blockTags.forEach(blockTag =>{
                if (forumTag.name === blockTag) foundForumBlockTags.push(forumTag.id);
            })
        })
        if (!foundForumTags.length || !foundForumBlockTags) return;
        
        // Checks if thread has the tags in foundForumTags[] AND if thread doesn't have tags in blockTags[]
        let applyTags = [];
        foundForumTags.forEach(foundForumTag =>{
            foundForumBlockTags.forEach(foundForumBlockTag =>{
                if (!threadTags.includes(foundForumTag) && !threadTags.includes(foundForumBlockTag)){
                    applyTags.push(foundForumTag);
                }
            })
        })
        
        updateTags(channel, applyTags);
    })
}

exports.resolveSuggestion = (client, Events) =>{
    client.on(Events.ThreadUpdate, (oldChannel, newChannel) =>{
        addedTags = newChannel.appliedTags.filter(n => !oldChannel.appliedTags.includes(n));
        if (!addedTags.length) return;

        // When a tag is added, if the tag is approved, denied, or implemented, close the thread

        // let closeTags = ["Approved", "Denied", "Implemented"];
        // let removeTags = ["Awaiting Response"];
        let user;
        newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 }).then((audit) =>{
            user = audit.entries.first().executor.id;
        });

        let forumTagsByName = new Map();
        let forumTagsById = new Map();
        
        // Define maps
        newChannel.parent.availableTags.forEach(availableTag =>{
            forumTagsByName.set(availableTag.name, availableTag.id);
            forumTagsById.set(availableTag.id, availableTag.name);
        });

        // Set message and remove tags depending on which tags were added
        let message = "";
        let removeTags = [];
        addedTags.forEach(addedTag =>{
            switch (forumTagsById.get(addedTag)){
                case "Approved":
                    message = "approved";
                    console.log("pass");
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
                    console.log(forumTagsById.get(addedTag));
                    return;
            }
        })
        removeTags.push(forumTagsByName.get("Awaiting Response"));
        
        // Remove tags
        updateTags(newChannel, [], removeTags);

        // Send message and close post
        newChannel.fetchOwner().then((owner) =>{
            newChannel.send(`Hello <@${owner.id}>! This suggestion has been ${message} by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${user}>. This post has been locked and closed.`).then(() => {
                newChannel.setLocked(true);
                newChannel.setArchived(true);
            });
        });


        // Checks if forum channel has tags in closeTags[]
        // addedTags.forEach(addedTag =>{
                // newChannel.parent.availableTags.forEach(availableTag =>{
                    // if (availableTag.id === addedTag){}

                    // if (closeTags.includes(availableTag.name)) forumTags.push(availableTag.id);
                // })

// `Hello <@${owner.id}>! This suggestion has been **approved** by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${audit.entries.first().executor.id}>. This post has been locked and closed.` 
        // })
        // if (!forumTags.length) return;

        // Display different messages depending on which tags were added to the thread channel
        
        // let message;
        // forumTags.forEach(forumTag =>{
        //     switch(forumTag.name){
        //         case "Approved":
        //             message = "approved"
        //             break;
        //         case "Denied":
        //             message = "denied"
        //             break;
        //         case "Implemented":
        //             message = "implemented";
        //             break;
        //         default:
        //             return;
        //     };
        // });
        // for (let addedTag = 0; addedTag < addedTags.length; addedTag++){
        //     availableTag = newChannel.parent.availableTags.find(n => (n.id == addedTags[addedTag]));
        //     newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 }).then( (audit) =>{
        //         if (availableTag.name === "Awaiting Response")
        //         switch (availableTag.name){
        //             case "Approved":
        //                 // If thread has waiting response, remove tag
        //                 // Message
        //         }

        //         newChannel.send(message).then(() =>{
        //             newChannel.setLocked(true);
        //             newChannel.setArchived(true);
        //         })
        //     })

        //     if (tag.name == "Approved" || tag.name == "Denied" || tag.name == "Implemented"){
        //         newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 })
        //         .then((audit) =>{
        //             newChannel.fetchOwner()
        //             .then((owner) =>{
        //                 newChannel.send(
        //                     tag.name == "Approved" ? `Hello <@${owner.id}>! This suggestion has been **approved** by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${audit.entries.first().executor.id}>. This post has been locked and closed.` :
        //                     tag.name == "Denied" ? `Hello <@${owner.id}>! This suggestion has been **denied** by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${audit.entries.first().executor.id}>. This post has been locked and closed.` :
        //                     `Hello <@${owner.id}>! This suggestion has been **implemented**!`)
        //                 .then(() =>{
        //                     newChannel.setLocked(true);
        //                     newChannel.setArchived(true);
        //                 })
        //             });
        //         }); 
                
        //         for (let a = 0; a < newChannel.parent.availableTags.length; a++){
        //             let availableTag = newChannel.parent.availableTags[a]
        //             switch (availableTag.name){
        //                 case "Awaiting Response":
        //                     if (newChannel.appliedTags.includes(availableTag.id)){
        //                         newChannel.setAppliedTags(newChannel.appliedTags.filter( n =>n !== newChannel.parent.availableTags[a].id))
        //                     }
        //             }


        //             if (newChannel.parent.availableTags[a].name === "Awaiting Response"){
        //                 // If channel has the tag, remove it
        //                 if (newChannel.appliedTags.includes(newChannel.parent.availableTags[a].id)){
        //                     newChannel.setAppliedTags(newChannel.appliedTags.filter( n =>n !== newChannel.parent.availableTags[a].id))
        //                 }
        //             }
        //             if (newChannel.parent.availableTags[a].name === "Not Implemented"){
        //                 // If channel doesn't have the tag, apply it
        //                 if (!newChannel.appliedTags.includes(newChannel.parent.availableTags[a].id)){

        //                 }
        //             }
        //         }
        //     }
        // }
    })
}