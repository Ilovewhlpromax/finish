// Firebase配置 - 请替换为您自己的Firebase配置
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    loadItems();
    loadComments();
    initAuth();
    
    // 启动实时留言轮询
    startCommentPolling();
    
    // 藏品上传表单提交
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        uploadItem();
    });
    
    // 留言表单提交
    document.getElementById('commentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addComment();
    });
    
    // 登录按钮点击事件
    document.getElementById('login-btn').addEventListener('click', function() {
        document.getElementById('login-modal').style.display = 'block';
    });
    
    // 注册按钮点击事件
    document.getElementById('register-btn').addEventListener('click', function() {
        document.getElementById('register-modal').style.display = 'block';
    });
    
    // 关闭模态框
    document.querySelectorAll('.close').forEach(function(closeBtn) {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // 注册表单提交
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        registerUser();
    });
    
    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        loginUser();
    });
    
    // 退出按钮点击事件
    document.getElementById('logout-btn').addEventListener('click', function() {
        logoutUser();
    });
    
    // 表情包按钮点击事件
    document.querySelectorAll('.emoji-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const emoji = this.getAttribute('data-emoji');
            const commentContent = document.getElementById('commentContent');
            commentContent.value += emoji;
        });
    });
    
    // 关注按钮点击事件
    document.getElementById('follow-btn').addEventListener('click', function() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            alert('请先登录');
            return;
        }
        openFollowModal();
    });
    
    // 私信按钮点击事件
    document.getElementById('message-btn').addEventListener('click', function() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            alert('请先登录');
            return;
        }
        openMessageModal();
    });
    
    // 发送私信按钮点击事件
    document.getElementById('send-message-btn').addEventListener('click', function() {
        sendMessage();
    });
    
    // 私信输入框回车发送
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 监听认证状态变化
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // 用户已登录
            const currentUser = {
                uid: user.uid,
                username: user.displayName || user.email.split('@')[0],
                email: user.email
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showUserInfo(currentUser);
        } else {
            // 用户未登录
            localStorage.removeItem('currentUser');
            hideUserInfo();
        }
    });
});

// 启动留言轮询
function startCommentPolling() {
    // 使用Firebase实时监听留言
    database.ref('comments').on('value', function(snapshot) {
        loadCommentsFromFirebase(snapshot);
    });
}

// 从Firebase加载留言
function loadCommentsFromFirebase(snapshot) {
    const commentsContainer = document.getElementById('commentsContainer');
    const comments = [];
    
    snapshot.forEach(function(childSnapshot) {
        comments.push(childSnapshot.val());
    });
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">暂无留言，快来发表你的第一条留言吧！</p>';
        return;
    }
    
    commentsContainer.innerHTML = '';
    
    comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-floor">${index + 1}楼</span>
                <span class="commenter">${comment.username}</span>
                <span class="comment-time">${comment.timestamp}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        `;
        commentsContainer.appendChild(commentElement);
    });
}

// 添加留言
function addComment() {
    const commentContent = document.getElementById('commentContent').value;
    
    // 检查用户是否登录
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('请先登录后再发表留言');
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    // 保存到Firebase数据库
    database.ref('comments').push({
        userId: user.uid,
        username: user.username,
        content: commentContent,
        timestamp: new Date().toLocaleString()
    }).then(function() {
        // 清空表单
        document.getElementById('commentForm').reset();
    }).catch(function(error) {
        alert('发表留言失败：' + error.message);
    });
}

// 初始化用户认证状态
function initAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showUserInfo(JSON.parse(currentUser));
    }
}

// 显示用户信息
function showUserInfo(user) {
    document.getElementById('user-controls').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('current-user').textContent = user.username;
}

// 隐藏用户信息
function hideUserInfo() {
    document.getElementById('user-controls').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
}

// 用户注册
function registerUser() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 表单验证
    if (!username || !password || !confirmPassword) {
        alert('请填写所有字段');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    if (password.length < 6) {
        alert('密码长度至少6位');
        return;
    }
    
    // 使用Firebase注册用户
    auth.createUserWithEmailAndPassword(username + '@example.com', password)
        .then(function(userCredential) {
            const user = userCredential.user;
            
            // 更新用户显示名称
            return user.updateProfile({
                displayName: username
            }).then(function() {
                // 保存用户信息到数据库
                return database.ref('users/' + user.uid).set({
                    username: username,
                    email: user.email,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
            });
        })
        .then(function() {
            // 关闭模态框并清空表单
            document.getElementById('register-modal').style.display = 'none';
            document.getElementById('registerForm').reset();
            
            alert('注册成功，请登录');
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/email-already-in-use') {
                alert('用户名已存在');
            } else if (errorCode === 'auth/weak-password') {
                alert('密码强度不够');
            } else {
                alert('注册失败：' + errorMessage);
            }
        });
}

// 用户登录
function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // 表单验证
    if (!username || !password) {
        alert('请填写所有字段');
        return;
    }
    
    // 使用Firebase登录用户
    auth.signInWithEmailAndPassword(username + '@example.com', password)
        .then(function(userCredential) {
            // 关闭模态框并清空表单
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('loginForm').reset();
            
            alert('登录成功');
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/user-not-found') {
                alert('用户不存在');
            } else if (errorCode === 'auth/wrong-password') {
                alert('密码错误');
            } else {
                alert('登录失败：' + errorMessage);
            }
        });
}

// 用户退出
function logoutUser() {
    auth.signOut().then(function() {
        alert('已退出登录');
    }).catch(function(error) {
        alert('退出失败：' + error.message);
    });
}

// 打开关注模态框
function openFollowModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const followList = document.getElementById('follow-list');
    
    // 从Firebase获取所有用户
    database.ref('users').once('value').then(function(snapshot) {
        const users = [];
        snapshot.forEach(function(childSnapshot) {
            users.push(childSnapshot.val());
        });
        
        // 获取当前用户的关注列表
        database.ref('follows').orderByChild('followerId').equalTo(currentUser.uid).once('value').then(function(followSnapshot) {
            const myFollows = [];
            followSnapshot.forEach(function(childSnapshot) {
                myFollows.push(childSnapshot.val());
            });
            
            followList.innerHTML = '';
            
            users.forEach(user => {
                if (user.username !== currentUser.username) {
                    const isFollowing = myFollows.some(f => f.followingId === user.uid);
                    const userItem = document.createElement('div');
                    userItem.className = 'user-item';
                    userItem.innerHTML = `
                        <span class="user-item-name">${user.username}</span>
                        <button class="follow-btn ${isFollowing ? 'following' : ''}" data-user-id="${user.uid}">
                            ${isFollowing ? '已关注' : '关注'}
                        </button>
                    `;
                    followList.appendChild(userItem);
                }
            });
            
            // 绑定关注按钮事件
            document.querySelectorAll('.follow-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-user-id');
                    if (this.classList.contains('following')) {
                        unfollowUser(userId);
                    } else {
                        followUser(userId);
                    }
                });
            });
        });
    });
    
    document.getElementById('follow-modal').style.display = 'block';
}

// 关注用户
function followUser(userId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    database.ref('follows').push({
        followerId: currentUser.uid,
        followingId: userId,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(function() {
        openFollowModal(); // 重新加载关注列表
    }).catch(function(error) {
        alert('关注失败：' + error.message);
    });
}

// 取消关注用户
function unfollowUser(userId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    database.ref('follows').orderByChild('followerId').equalTo(currentUser.uid).once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const follow = childSnapshot.val();
            if (follow.followingId === userId) {
                database.ref('follows/' + childSnapshot.key).remove();
            }
        });
        openFollowModal(); // 重新加载关注列表
    }).catch(function(error) {
        alert('取消关注失败：' + error.message);
    });
}

// 打开私信模态框
function openMessageModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const messageUsersList = document.getElementById('message-users-list');
    
    // 从Firebase获取所有用户
    database.ref('users').once('value').then(function(snapshot) {
        const users = [];
        snapshot.forEach(function(childSnapshot) {
            users.push(childSnapshot.val());
        });
        
        messageUsersList.innerHTML = '';
        
        users.forEach(user => {
            if (user.username !== currentUser.username) {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <span class="user-item-name">${user.username}</span>
                `;
                userItem.addEventListener('click', function() {
                    loadMessages(user.uid);
                });
                messageUsersList.appendChild(userItem);
            }
        });
    });
    
    document.getElementById('message-modal').style.display = 'block';
}

// 加载与特定用户的聊天记录
function loadMessages(targetUserId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const messageChatArea = document.getElementById('message-chat-area');
    
    // 使用Firebase实时监听消息
    database.ref('messages').on('value', function(snapshot) {
        const messages = [];
        
        snapshot.forEach(function(childSnapshot) {
            const message = childSnapshot.val();
            message.key = childSnapshot.key;
            messages.push(message);
        });
        
        // 获取两个用户之间的消息
        const userMessages = messages.filter(m => 
            (m.senderId === currentUser.uid && m.receiverId === targetUserId) ||
            (m.senderId === targetUserId && m.receiverId === currentUser.uid)
        );
        
        messageChatArea.innerHTML = '';
        
        if (userMessages.length === 0) {
            messageChatArea.innerHTML = '<p style="text-align: center; color: #999;">暂无消息</p>';
        } else {
            userMessages.forEach(message => {
                const messageItem = document.createElement('div');
                messageItem.className = `message-item ${message.senderId === currentUser.uid ? 'sent' : 'received'}`;
                messageItem.innerHTML = `
                    <div class="message-header">${message.timestamp}</div>
                    <div class="message-content">${message.content}</div>
                `;
                messageChatArea.appendChild(messageItem);
            });
        }
        
        // 滚动到底部
        messageChatArea.scrollTop = messageChatArea.scrollHeight;
        
        // 保存当前聊天对象
        messageChatArea.setAttribute('data-target-user-id', targetUserId);
    });
}

// 发送私信
function sendMessage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const messageInput = document.getElementById('message-input');
    const messageChatArea = document.getElementById('message-chat-area');
    const targetUserId = messageChatArea.getAttribute('data-target-user-id');
    
    if (!targetUserId) {
        alert('请先选择要发送消息的用户');
        return;
    }
    
    const content = messageInput.value.trim();
    if (!content) {
        alert('请输入消息内容');
        return;
    }
    
    // 检查私信限制
    checkMessageLimit(currentUser.uid, targetUserId).then(function(canSend) {
        if (!canSend) {
            alert('非互关用户最多只能发送3条私信');
            return;
        }
        
        // 保存消息到Firebase
        database.ref('messages').push({
            senderId: currentUser.uid,
            receiverId: targetUserId,
            content: content,
            timestamp: new Date().toLocaleString()
        }).then(function() {
            // 清空输入框
            messageInput.value = '';
        }).catch(function(error) {
            alert('发送消息失败：' + error.message);
        });
    });
}

// 检查私信限制
function checkMessageLimit(senderId, receiverId) {
    return new Promise(function(resolve) {
        // 获取关注关系
        database.ref('follows').once('value').then(function(snapshot) {
            const follows = [];
            snapshot.forEach(function(childSnapshot) {
                follows.push(childSnapshot.val());
            });
            
            // 检查是否互关
            const isMutualFollow = 
                follows.some(f => f.followerId === senderId && f.followingId === receiverId) &&
                follows.some(f => f.followerId === receiverId && f.followingId === senderId);
            
            // 如果互关，没有限制
            if (isMutualFollow) {
                resolve(true);
                return;
            }
            
            // 如果不互关，检查已发送的消息数量
            database.ref('messages').once('value').then(function(messageSnapshot) {
                const messages = [];
                messageSnapshot.forEach(function(childSnapshot) {
                    messages.push(childSnapshot.val());
                });
                
                const sentMessages = messages.filter(m => m.senderId === senderId && m.receiverId === receiverId);
                resolve(sentMessages.length < 3);
            });
        });
    });
}

// 上传藏品
function uploadItem() {
    const itemName = document.getElementById('itemName').value;
    const itemDescription = document.getElementById('itemDescription').value;
    const itemType = document.getElementById('itemType').value;
    const itemMedia = document.getElementById('itemMedia').files[0];
    
    if (!itemMedia) {
        alert('请选择文件');
        return;
    }
    
    // 检查用户是否登录
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('请先登录后再上传藏品');
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    // 检查文件大小（限制为10MB）
    if (itemMedia.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB');
        return;
    }
    
    // 上传文件到Firebase Storage
    const fileName = Date.now() + '_' + itemMedia.name;
    const storageRef = storage.ref('items/' + fileName);
    const uploadTask = storageRef.put(itemMedia);
    
    uploadTask.on('state_changed', 
        function(snapshot) {
            // 上传进度
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('上传进度: ' + progress + '%');
        }, 
        function(error) {
            // 上传失败
            alert('上传失败：' + error.message);
        }, 
        function() {
            // 上传成功
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                // 保存藏品信息到数据库
                const itemData = {
                    id: Date.now(),
                    userId: user.uid,
                    username: user.username,
                    name: itemName,
                    description: itemDescription,
                    type: itemType,
                    mediaUrl: downloadURL,
                    timestamp: new Date().toLocaleString()
                };
                
                database.ref('items').push(itemData).then(function() {
                    // 清空表单
                    document.getElementById('uploadForm').reset();
                    alert('藏品上传成功！');
                }).catch(function(error) {
                    alert('保存藏品信息失败：' + error.message);
                });
            });
        }
    );
}

// 加载藏品
function loadItems() {
    const itemsContainer = document.getElementById('itemsContainer');
    
    // 使用Firebase实时监听藏品
    database.ref('items').on('value', function(snapshot) {
        const items = [];
        
        snapshot.forEach(function(childSnapshot) {
            items.push(childSnapshot.val());
        });
        
        if (items.length === 0) {
            itemsContainer.innerHTML = '<p class="no-items">暂无藏品，快来上传你的第一件藏品吧！</p>';
            return;
        }
        
        itemsContainer.innerHTML = '';
        
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            
            let mediaElement;
            if (item.type === 'video') {
                mediaElement = `<video src="${item.mediaUrl}" class="item-video" controls></video>`;
            } else {
                mediaElement = `<img src="${item.mediaUrl}" alt="${item.name}" class="item-image">`;
            }
            
            itemCard.innerHTML = `
                ${mediaElement}
                <div class="item-content">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    <p class="item-time">${item.username} · ${item.timestamp}</p>
                </div>
            `;
            itemsContainer.appendChild(itemCard);
        });
    });
}

// 添加留言
function addComment() {
    const commentContent = document.getElementById('commentContent').value;
    
    // 检查用户是否登录
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('请先登录后再发表留言');
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    const comment = {
        id: Date.now(),
        userId: user.id,
        name: user.username,
        content: commentContent,
        timestamp: new Date().toLocaleString()
    };
    
    // 保存到localStorage
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push(comment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    // 重新加载留言
    loadComments();
    
    // 清空表单
    document.getElementById('commentForm').reset();
}

// 加载留言
function loadComments() {
    const commentsContainer = document.getElementById('commentsContainer');
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">暂无留言，快来发表你的第一条留言吧！</p>';
        return;
    }
    
    commentsContainer.innerHTML = '';
    
    comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-floor">${index + 1}楼</span>
                <span class="commenter">${comment.name}</span>
                <span class="comment-time">${comment.timestamp}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        `;
        commentsContainer.appendChild(commentElement);
    });
}