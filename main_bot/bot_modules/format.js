const prefix = "?format";
const requiredRole = "398732282229293059"; 

function modifyItemContent(name, category, quality, lore, chunkSize = 4) {
    const modifiedName = `&6&l${name}`;
    const modifiedCategory = `${category}`; // ADD COLOUR CODE
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
        chunks.push(words.slice(i, i + chunkSize).join(' '));
        chunks.push(`${prependValue}${chunk}`);
    }

    return chunks;
}

function generateItemQualityStars(quality){
    switch (quality) {
        case '1':
            return '1 star';
        case '2':
            return '2 stars';
        case '3':
            return '3 stars';
        case '4':
            return '4 stars';
        case '5':
            return '5 stars';
        default:
            return 'Unknown'; 
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
  category: "${modifiedItem.category}"
  quality: "${modifiedItem.quality}"
`;
        modifiedItem.lore.forEach((chunk, index) => {
            yamlContent += `
  lore_chunk_${index + 1}: "${chunk}"`;
        });

        // Send the YAML response as a message
        msg.reply(`Here is the formatted item in YAML format:\n\`\`\`yaml\n${yamlContent}\n\`\`\``);
    });
};
