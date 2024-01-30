const { Client, GatewayIntentBits, REST } = require('discord.js');
const { RESTAPIVersion } = require('discord-api-types/v9');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
//---------------------------------------------------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});
//---------------------------------------------------------------------------
const token = 'token';
const clientId = 'bot_id';
const guildId = 'server_id';
const targetUserId = 'your_id';
//---------------------------------------------------------------------------
const supportRoleName = 'name_role_staffs'; // استبدل بالاسم الصحيح للرول
const emoji = '> <:shieldquarter:1201237677136171008>丨';
//---------------------------------------------------------------------------

let statuses = {};
if (fs.existsSync('statuses.json')) {
    const data = fs.readFileSync('statuses.json');
    statuses = JSON.parse(data);
}

//---------------------------------------------------------------------------
const commands = [
    {
        name: 'status-support',
        description: 'to see status of support team',
        type: 1, 
    },
    {
        name: 'duty',
        description: 'Changing the duty status( on/off )',
        type: 1, 
        options: [
            {
                name: 'status',
                description: 'to change activity of status',
                type: 3, 
                required: true,
                choices: [
                    {
                        name: 'on',
                        value: 'on',
                    },
                    {
                        name: 'off',
                        value: 'off',
                    },
                ],
            },
        ],
    },
];
//---------------------------------------------------------------------------

const rest = new REST({ version: '9' }).setToken(token);

//---------------------------------------------------------------------------

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//---------------------------------------------------------------------------

let supportMessage;

//---------------------------------------------------------------------------

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'status-support' && interaction.user.id === targetUserId) {
        await sendSupportMembersEmbed(interaction.guild, interaction.channel);
        // قم بتعيين التحديث التلقائي للرسالة كل 60 ثانية
        setInterval(() => updateSupportMessage(interaction.guild, interaction.channel), 60000);
    } else if (commandName === 'duty') {
        // تحقق من الرتبة هنا
        const supportRole = interaction.member.roles.cache.find((role) => role.name === supportRoleName);
        
        if (!supportRole) {
            return interaction.reply('ليس لديك الصلاحيات.');
        }

        await handleDutyCommand(interaction);
    }
});

//---------------------------------------------------------------------------

async function sendSupportMembersEmbed(guild, channel) {
    const embed = {
        title: 'Status of Support team',
        color: 16768613,
        image:{
            url:'https://media.discordapp.net/attachments/1194330894358564944/1198341607934673037/1.png?ex=65c7c817&is=65b55317&hm=5fc2f593c96750d9b53b300116ab562d5b7de787482395dc43043523323014da&=&format=webp&quality=lossless&width=1025&height=77'
          },  
        fields: [],
    };
    const row = {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: 'Read this Rules',
            emoji: '<:bookss:1201236348623925389>',
            url: 'https://discord.com/channels/1194306643878498324/1194321326450692209',
          },
          {
            type: 2,
            style: 5,
            label: ' Contact Support',
            emoji: '<:Click:1200431274129621012>',
            url: 'https://discord.com/channels/1194306643878498324/1194320997759856671', 
          },
        ],
      };

    const supportRole = guild.roles.cache.find((role) => role.name === supportRoleName);

    if (!supportRole) {
        return channel.send('دور الدعم غير موجود. يرجى التحقق من الاسم.');
    }

    try {
        const supportMembers = supportRole.members;

        if (supportMembers.size > 0) {
            const supportMemberNames = Array.from(supportMembers.values()).map((supportMember) => {
                const status = statuses[supportMember.id] || '';
                return `${emoji} ${supportMember.toString()} ${status}`;
            });
            
            embed.fields.push({
                name: 'Support Team of the server:',
                value: supportMemberNames.join('\n'),
            });
        } else {
            embed.description = 'لا يوجد أعضاء في دور الدعم.';
        }

if (!supportMessage) {
    supportMessage = await channel.send({ embeds: [embed],components: [row] });
} else {
  
    await supportMessage.edit({ embeds: [embed],components: [row] });
}
    } catch (error) {
        console.error(error);
        return channel.send('حدث خطأ أثناء جلب الأعضاء.');
    }
}
async function updateSupportMessage(guild, channel) {
    await sendSupportMembersEmbed(guild, channel);
}

//---------------------------------------------------------------------------

async function handleDutyCommand(interaction) {
    const statusOption = interaction.options.getString('status');
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member) {
        return interaction.followUp('حدثت خطأ أثناء جلب العضو.');
    }

    const supportRole = interaction.guild.roles.cache.find((role) => role.name === supportRoleName);

    if (!supportRole) {
        return interaction.followUp('دور الدعم غير موجود. يرجى التحقق من الاسم.');
    }

    await interaction.deferReply(); 

    
    const userId = member.id;
    statuses[userId] = statusOption === 'on'
        ? '**\`\`I am here if you want help 🟢\`\`**'
        : '**\`\`I can\'t give help now 🔴\`\`**';

    
    fs.writeFileSync('statuses.json', JSON.stringify(statuses, null, 2));

    if (statusOption === 'on') {
        await member.roles.add(supportRole);
    } else if (statusOption === 'off') {

    }

    await interaction.editReply(`حالتك الجديدة: ${statuses[userId]}`);
}

//---------------------------------------------------------------------------

client.login(token);






