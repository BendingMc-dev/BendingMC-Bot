exports.newSuggestion = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        // Check if author of message is the bot and return if true
        if (msg.author.id === client.user.id){
            return
        }

        let tagsToApply = ["Awaiting Response"];
        let finalTags = msg.channel.appliedTags;
    
        // Check if message is in forum channel (By id)
        if (msg.channel.isThread()){
            // Iterate tags to be applied automatically
            for (let tags = 0; tags < tagsToApply.length; tags++){
                // Iterate tags available in the forum
                for (let forumTags = 0; forumTags < msg.channel.parent.availableTags.length; forumTags++){
                    // Checks if the forum has the tag to be applied
                    if (msg.channel.parent.availableTags[forumTags].name == tagsToApply[tags]){
                        // Checks if the tag to be applied is already applied in the thread
                        if (!(msg.channel.appliedTags.includes(tagsToApply[tags]))){
                            finalTags.push(msg.channel.parent.availableTags[forumTags].id);
                        }
                    }
                }
            }
            msg.channel.setAppliedTags(finalTags);
        }
    
    })
}

exports.resolveSuggestion = (client, Events) =>{
    client.on(Events.ThreadUpdate, (oldChannel, newChannel) =>{
        addedTags = newChannel.appliedTags.filter(n => !oldChannel.appliedTags.includes(n))

        if (!addedTags.length){
            return
        }

        for (let a = 0; a < addedTags.length; a++){
            tag = newChannel.parent.availableTags.find(n => (n.id == addedTags[a]))

            if (tag.name == "Approved" || tag.name == "Denied" || tag.name == "Implemented"){
                newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 })
                .then((audit) =>{
                    newChannel.fetchOwner()
                    .then((owner) =>{
                        newChannel.send(
                            tag.name == "Approved" ? `Hello <@${owner.id}>! This suggestion has been **approved** by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${audit.entries.first().executor.id}>. This post has been locked and closed.` :
                            tag.name == "Denied" ? `Hello <@${owner.id}>! This suggestion has been **denied** by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${audit.entries.first().executor.id}>. This post has been locked and closed.` :
                            `Hello <@${owner.id}>! This suggestion has been **implemented**!`
                        )
                        .then(() =>{
                            newChannel.setLocked(true);
                            newChannel.setArchived(true);
                        })
                    });
                }); 
                
                for (let a = 0; a < newChannel.parent.availableTags.length; a++){
                    if (newChannel.parent.availableTags[a].name === "Awaiting Response"){
                        if (newChannel.appliedTags.includes(newChannel.parent.availableTags[a].id)){
                            newChannel.setAppliedTags(newChannel.appliedTags.filter( n =>n !== newChannel.parent.availableTags[a].id))
                        }
                    }
                }
            }
        }
    })
}
