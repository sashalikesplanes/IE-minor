docker cp 1a5a24ff056f5a9f0cd2e3c94cba3fb0bd298a0cede4962b77e867bbcc9c9c50:/home/nanodet-sasha/build/nanodet_demo ./temp
# docker cp 071741541a2c953024c65854adefa640cfce78059baff419b13fb969d36f9336:/usr/lib/$1 $2
scp ./temp root@10.254.239.1:/home/nanodet-build/nanodet
rm ./temp
ssh root@10.254.239.1

cd /home/nanodet-sasha


