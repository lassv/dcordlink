require("dotenv").config();
const router = require("express").Router();
const DiscordInvite = require("../database/models/Invite");
const Discord = require("discord.js");
const bot = require("../bot");

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

router.post("/v1/dash/create", (req, res) => {
  const { redirect, slug } = req.body;
  const newInvite = new DiscordInvite({
    redirect,
    slug,
    createdBy: {
      id: req.user.id,
      discord_id: req.user.discordId,
      username: req.user.username,
      discriminator: req.user.discriminator,
      avatar: req.user.avatar,
    },
  });

  newInvite
    .save()
    .then((invite) => res.redirect("/dash?success=true"))
    .catch((err) => console.log(err));

  let channel = bot.channels.cache.get("969674349693001778");
  let embed = new Discord.MessageEmbed()
    .setTitle("➕ New Invite")
    .setDescription(
      `<@${req.user.discordId}> created the invite **${newInvite.slug}**`
    )
    .setColor("#43b581");

  channel.send(embed);
});

router.put("/v1/dash/edit/:id", (req, res) => {
  DiscordInvite.findByIdAndUpdate(
    req.params.id,
    {
      redirect: req.body.redirect,
    },
    { new: true },
    (err, invite) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        let channel = bot.channels.cache.get("969674349693001778");

        let embed = new Discord.MessageEmbed()
          .setTitle("✏ Invite Edited")
          .setDescription(
            `<@${req.user.discordId}> edited the invite **${invite.slug}**`
          )
          .setColor("#5865f2");

        channel.send(embed);

        req.flash("message", "Successfully updated invite.");
        res.redirect(`/dash/i/${req.params.id}/edit`);
      }
    }
  );
});

router.put("/v1/dash/edit/embed/:id", (req, res) => {
  DiscordInvite.findByIdAndUpdate(
    req.params.id,
    {
      meta: {
        title: req.body.title,
        description: req.body.description,
        color: req.body.color,
        image: req.body.image,
      },
    },
    { new: true },
    (err, invite) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        let channel = bot.channels.cache.get("969674349693001778");

        let embed = new Discord.MessageEmbed()
          .setTitle("✏ Invite Edited")
          .setDescription(
            `<@${req.user.discordId}> edited the invite **${invite.slug}**`
          )
          .setColor("#5865f2");

        channel.send(embed);

        req.flash("messageEmbed", "Successfully updated embed.");
        res.redirect(`/dash/i/${req.params.id}/edit/embed`);
      }
    }
  );
});

router.get("/v1/invites", (req, res) => {
  DiscordInvite.find({}, (err, invites) => {
    const filterInvites = invites.map((invite) => {
      return {
        redirect: invite.redirect,
        owner: invite.createdBy.discord_id,
        slug: invite.slug,

        meta: {
          title: invite.meta.title,
          description: invite.meta.description,
          color: invite.meta.color,
        },
      };
    });

    res.send(filterInvites);
  });
});

module.exports = router;
