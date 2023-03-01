
function updateTags(channel, addTags = [], removeTags = []){
    let channelTags = channel.appliedTags;
    let finalTags = [];
    for (let channelTag = 0; channelTag < channelTags.length; channelTag++){
        for (let addTag = 0; addTag < addTags.length; addTag++){
            if (addTag !== channelTag){
                finalTags.push(addTag);
            }
        }
        for (let removeTag = 0; removeTag < removeTags.length; removeTag++){
            if (removeTag !== channelTag){
                finalTags.push(channelTag);
            }
        }
    }
    return finalTags;
}

exports.newSuggestion = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        // Check if author of message is the bot and return if true
        if (msg.author.id === client.user.id){
            return
        }

        let tagsToApply = ["Awaiting Response"];
    
        if (msg.channel.isThread()){
            let finalTags = msg.channel.appliedTags;
            for (let tags = 0; tags < tagsToApply.length; tags++){
                for (let forumTags = 0; forumTags < msg.channel.parent.availableTags.length; forumTags++){
                    if (msg.channel.parent.availableTags[forumTags].name == tagsToApply[tags]){
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

        for (let addedTag = 0; addedTag < addedTags.length; addedTag++){
            availableTag = newChannel.parent.availableTags.find(n => (n.id == addedTags[addedTag]));
            newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 }).then( (audit) =>{
                if (availableTag.name === "Awaiting Response")
                switch (availableTag.name){
                    case "Approved":
                        // If thread has waiting response, remove tag
                        // Message
                }

                newChannel.send(message).then(() =>{
                    newChannel.setLocked(true);
                    newChannel.setArchived(true);
                })
            })

            if (tag.name == "Approved" || tag.name == "Denied" || tag.name == "Implemented"){
                newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 })
                .then((audit) =>{
                    newChannel.fetchOwner()
                    .then((owner) =>{
                        newChannel.send(
                            tag.name == "Approved" ? `Hello <@${owner.id}>! This suggestion has been **approved** by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${audit.entries.first().executor.id}>. This post has been locked and closed.` :
                            tag.name == "Denied" ? `Hello <@${owner.id}>! This suggestion has been **denied** by <@${audit.entries.first().executor.id}>! If you have any questions regarding the decision, please contact <@${audit.entries.first().executor.id}>. This post has been locked and closed.` :
                            `Hello <@${owner.id}>! This suggestion has been **implemented**!`)
                        .then(() =>{
                            newChannel.setLocked(true);
                            newChannel.setArchived(true);
                        })
                    });
                }); 
                
                for (let a = 0; a < newChannel.parent.availableTags.length; a++){
                    let availableTag = newChannel.parent.availableTags[a]
                    switch (availableTag.name){
                        case "Awaiting Response":
                            if (newChannel.appliedTags.includes(availableTag.id)){
                                newChannel.setAppliedTags(newChannel.appliedTags.filter( n =>n !== newChannel.parent.availableTags[a].id))
                            }
                    }


                    if (newChannel.parent.availableTags[a].name === "Awaiting Response"){
                        // If channel has the tag, remove it
                        if (newChannel.appliedTags.includes(newChannel.parent.availableTags[a].id)){
                            newChannel.setAppliedTags(newChannel.appliedTags.filter( n =>n !== newChannel.parent.availableTags[a].id))
                        }
                    }
                    if (newChannel.parent.availableTags[a].name === "Not Implemented"){
                        // If channel doesn't have the tag, apply it
                        if (!newChannel.appliedTags.includes(newChannel.parent.availableTags[a].id)){

                        }
                    }
                }
            }
        }
    })
}