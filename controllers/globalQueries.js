const UserM = require('../models/userMongo.model');
const Groupe = require('../models/groupes.model');
const groupesModel = require('../models/groupes.model');

const Chat = require('../models/chat.model')
exports.globalQueries = class {

    static addUser(data) {
        return new Promise(async next => {
            const user = new UserM({
                id: data.id,
                nom: data.nom,
                prenoms: data.prenoms,
                email: data.email,
                pays: data.pays
            });
            user.save().then(r => {
                next({ etat: true, data: r });
            }).catch(err => {
                next({ etat: false, message: err });
            })
        });
    }

    static findUser(email) {
        return new Promise(async next => {
            UserM.findOne({ email: email }).then(r => {
                next({ etat: true, data: r });
            }).catch(err => {
                next({ etat: false, message: err });
            })
        });
    }



    // ce qui est mis en commentaire n'est plus utile

    /*   static setUser(data) {
           return new Promise(async next => {
               const all = await User.find({}).then(r => r);
               let id = all.length == 0 ? 1 : all[all.length - 1].id + 1;
               const user = await new User({
                   id: id,
                   nom: data.nom,
                   password: data.password
               });
               user.save().then(r => {
                   next({
                       etat: true
                   });
               }).catch(err => {
                   next({
                       etat: false,
                       err: err
                   });
               })
           })
       } */


    /*  static getUser(data) {
          return new Promise(async next => {
              await User.findOne({
                  nom: data.nom,
                  password: data.password
              }).then(s => {
                  next({
                      etat: true,
                      data: s
                  });
              }).catch(err => {
                  next({
                      etat: false,
                      err: err
                  });
              })
          })
      } */

    static newConnection(data) {
        console.log('data', data);
        return new Promise(async next => {
            await UserM.findOne({
                id: data.id_client
            }).then(async s => {
                if (s === null) {
                    next({
                        type: data.type,
                        status: false,
                        tableau: ["vous êtes lié à aucun groupe"]
                    });
                } else {
                    let Content = [];
                    const allGroupes = await Groupe.find({}).then(r => r);
                    allGroupes.forEach((groupe, index) => {
                        if (groupe.users.includes(s._id)) {
                            Content.push({
                                "id_client": s.id,
                                "name_client": s.nom,
                                "id_article": groupe.id,
                                "nom_article": groupe.title,
                                "image": groupe.image,
                            })
                        }
                        if (index === allGroupes.length - 1) {
                            console.log('Content', Content);
                            if (Content.length === 0) {
                                next({
                                    type: data.type,
                                    status: true,
                                    tableau: ["vous êtes lié à aucun groupe"]
                                });
                            } else {
                                next({
                                    type: data.type,
                                    status: true,
                                    tableau: Content
                                });
                            }

                        }
                    });
                }
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
            })
        })
    }

    static getUserGroupes(data) {
        console.log('data', data);
        return new Promise(async next => {
            await UserM.findOne({
                id: data.id_client
            }).then(async s => {
                if (s === null) {
                    next({
                        type: data.type,
                        status: false,
                        tableau: ["vous êtes lié à aucun groupe"]
                    });
                } else {
                    let Content = [];
                    const allGroupes = await Groupe.find({}).then(r => r);
                    allGroupes.forEach((groupe, index) => {
                        console.log('groupes', groupe.messages);
                        console.log('groupes2', groupe.messages[groupe.messages.length - 1]);
                        console.log('groupes3', groupe.messages[groupe.messages.length - 1].message);
                        if (groupe.users.includes(s._id)) {
                            Content.push({
                                "id_client": s.id,
                                "name_client": s.nom,
                                "id_article": groupe.id,
                                "nom_article": groupe.title,
                                "image": groupe.image,
                                "last": groupe.messages[groupe.messages.length - 1].message
                            })
                        }
                        if (index === allGroupes.length - 1) {
                            console.log('Content', Content);
                            if (Content.length === 0) {
                                next({
                                    type: data.type,
                                    status: true,
                                    tableau: ["vous êtes lié à aucun groupe"]
                                });
                            } else {
                                next({
                                    type: data.type,
                                    status: true,
                                    tableau: Content
                                });
                            }

                        }
                    });
                }
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
            })
        })
    }


    static setNewGroupOrUser(data) {
        return new Promise(async next => {
            await Groupe.findOne({
                id: data.id_article,
                title: data.nom_article
            }).then(async r => {
                if (r == null) {
                    await new Groupe({
                        id: data.id_article,
                        title: data.nom_article,
                        image: data.image,
                    }).save().then(async rg => {
                        const u1 = await UserM.findOne({
                            id: data.id_client,
                            nom: data.name_client
                        }).then(e => e);
                        if (u1 === null) {
                            const user = await new UserM({
                                id: data.id_client,
                                nom: data.name_client,
                                ws_id: data.ws_id,
                            });
                            user.save().then(ru => {
                                rg.users.push(ru._id);
                                console.log('ru', ru.id);
                                rg.save().then(async s => {
                                    const result = await this.getUserGroupes({
                                        id_client: ru.id
                                    });
                                    next({
                                        type: data.type,
                                        id_article: data.id_article,
                                        image: rg.image,
                                        status: result.status,
                                        tableau: result.tableau,
                                    });
                                    /* next({
                                         type: data.type,
                                         etat: true,
                                         id_groupe: rg.id,
                                         id_cient: ru.id,
                                         nom_groupe: rg.title,
                                         new_groupe: true
                                     }) */
                                })
                            })
                        } else {
                            rg.users.push(u1._id);
                            rg.save().then(async s => {
                                const result = await this.getUserGroupes({
                                    id_client: u1.id
                                });
                                console.log('result', result),
                                    next({
                                        type: data.type,
                                        id_article: data.id_article,
                                        image: rg.image,
                                        status: result.status,
                                        tableau: result.tableau,
                                    });
                                /* next({
                                    type: data.type,
                                    etat: true,
                                    id_groupe: rg.id,
                                    id_client: u1.id,
                                    nom_groupe: rg.title,
                                    new_groupe: true
                                }) */
                            })
                        }

                    })
                } else {
                    const user = await UserM.findOne({
                        id: data.id_client,
                        nom: data.name_client
                    }).then(s => s);
                    if (user == null) {
                        const nuser = await new UserM({
                            id: data.id_client,
                            id_article: data.id_article,
                            nom: data.name_client,
                            ws_id: data.ws_id,
                        })
                        nuser.save().then(ru => {
                            r.users.push(ru._id);
                            r.save().then(async s => {
                                const result = await this.getUserGroupes({
                                    id_client: ru.id
                                });
                                console.log('result', result),
                                    next({
                                        type: data.type,
                                        id_article: data.id_article,
                                        status: result.status,
                                        tableau: result.tableau,
                                    });
                                /*   next({
                                       type: data.type,
                                       etat: true,
                                       id_groupe: r.id,
                                       id_client: ru.id,
                                       nom_groupe: r.title,
                                       new_groupe: false
                                   }) */
                            })
                        })
                    } else {
                        if (!verif(r.users, user._id)) {
                            r.users.push(user._id);
                            r.save().then(async s => {
                                const result = await this.getUserGroupes({
                                    id_client: user.id
                                });
                                console.log('result', result),
                                    next({
                                        type: data.type,
                                        id_article: data.id_article,
                                        status: result.status,
                                        tableau: result.tableau,
                                    });
                                /*  next({
                                      type: data.type,
                                      etat: true,
                                      id_groupe: r.id,
                                      id_client: user.id,
                                      nom_groupe: r.title,
                                      new_groupe: false
                                  }) */
                            })
                        } else {
                            user.ws_id = data.ws_id;
                            user.save().then(async s => {
                                const result = await this.getUserGroupes({
                                    id_client: user.id
                                });
                                console.log('result', result),
                                    next({
                                        type: data.type,
                                        id_article: data.id_article,
                                        status: result.status,
                                        tableau: result.tableau,
                                    });
                                /* next({
                                     type: data.type,
                                     etat: true,
                                     id_groupe: r.id,
                                     id_client: s.id,
                                     nom_groupe: r.title,
                                     new_groupe: false
                                 }) */
                            })
                        }
                    }
                }
            })
        });
    }

    static setNewMessage(data) {
        return new Promise(async next => {
            const group = await Groupe.findOne({
                id: data.id_article
            }).then(r => r);
            const user = await UserM.findOne({
                id: data.id_client
            }).then(r => r);
            const message = {
                message: data.message,
                user: user._id,
            };
            group.messages.push(message);
            group.save().then(async s => {
                await Groupe.findOne({
                    id: data.id_article
                }).then(async s => {
                    next({
                        type: data.type,
                        status: true,
                        id_client: data.id_client,
                        id_article: data.id_article,
                        name_client: await getUserName(data.id_client).then(r => r),
                        name_article: s.title,
                        messages: s.messages
                    });
                });

            })
        })
    }

    static getGroupesUsers(id) {
        return new Promise(async next => {
            await Groupe.findOne({
                id: id
            }).populate('users').then(r => {
                next(r.users);
            }).catch(err => {
                next(err);
            });
        })
    }

    static getGroupeMessages(res, id) {
        return new Promise(async next => {
            await Groupe.findOne({
                id: res.id_article
            }).populate('messages.user').then(async r => {
                const user = await UserM.findOne({
                    id: res.id_client
                }).then(r => r);
                user.ws_id = id;
                user.save().then(async s => {
                    next({
                        type: res.type,
                        status: true,
                        id_client: res.id_client,
                        id_article: res.id_article,
                        name_client: await getUserName(res.id_client).then(r => r),
                        name_article: r.title,
                        image: r.image,
                        messages: r.messages
                    })
                })
            }).catch(err => {
                next({
                    type: res.type,
                    status: false,
                    message: [err]
                })
            })
        })
    }


    static getUserAllChats(data) {
        return new Promise(async (next) => {
            let user = await UserM.findOne({ id: data }).then(r => r._id);
            await Chat.find({ initiator: use } || { peer: user }).populate('initiator').populate('peer').then(r => {
                next({ etat: true, data: r })
            })

        })
    }
};
function verif(tab, id) {
    let verif = false;
    tab.forEach(user => {
        if (user._id.equals(id)) {
            verif = true;
        }
    });
    return verif;
}

async function getUserName(id) {
    return await UserM.findOne({
        id: id
    }).then(r => r.nom);
}
