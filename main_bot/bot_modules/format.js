const prefix = "?format";
const requiredRole = "398732282229293059"; 

function modifyItemContent(name, category, quality, lore, chunkSize = 4) {
    const modifiedName = `&6&l${name}`;
    const modifiedCategory = `&7${category}`;
    const modifiedQuality = generateItemQualityStars(quality);
    const loreChunks = splitLoreIntoChunks(lore, chunkSize); // Split lore into smaller chunks

    return {
        name: modifiedName,
        category: modifiedCategory,
        quality: modifiedQuality,
        lore: loreChunks
    };
}

function splitLoreIntoChunks(lore, chunkSize) {
    const prependValue = "&d"
    const words = lore.split(/\s+/); 
    const chunks = [];

    // Create chunks of the lore based on the chunk size
    for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' '); 
        chunks.push(chunk); 
        chunks.push(`${prependValue}${chunk}`);
    }

    return chunks;
}

function generateItemQualityStars(quality) {
    switch (quality) {
        case '1': return '&7⭑&8⭒⭒⭒⭒'; 
        case '2': return '&7⭑⭑&8⭒⭒⭒'; 
        case '3': return '&7⭑⭑⭑&8⭒⭒'; 
        case '4': return '&7⭑⭑⭑⭑&8⭒'; 
        case '5': return '&7⭑⭑⭑⭑⭑&8'; 
        default: return 'Unknown'; // Default case
    }
}

exports.onItemCommand = (client, Events) => {
    client.on(Events.MessageCreate, msg => {
        if (msg.author.id === client.user.id) return;
        if (!msg.content.startsWith(prefix)) return;
        if (!msg.member.roles.cache.has(requiredRole)) return;

        const command = msg.content.slice(prefix.length).trim();
        
        const commandParts = command.split(/\s+/);
        if (commandParts.length !== 4) {
            return msg.reply('Please provide all four values: name, category, quality, and lore.');
        }

        const [name, category, quality, lore] = commandParts;
        const modifiedItem = modifyItemContent(name, category, quality, lore);

        let yamlContent = `   
item:
    name: "${modifiedItem.name}"
    lore:
    - "${modifiedItem.category}"
    - "${modifiedItem.quality}"
    - ' '`;
        modifiedItem.lore.forEach((chunk, index) => {
            yamlContent += `
    - "${chunk}"`;
        });

        msg.reply(`Here is the formatted item in ItemsAdder compatable format:\n\`\`\`yaml\n${yamlContent}\n\`\`\``);
    });
};
