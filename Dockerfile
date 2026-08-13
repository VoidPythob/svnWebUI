FROM alpine:3.24
ENV LANG=zh_CN.UTF-8 \
    TZ=Asia/Shanghai \
    PS1="\u@\h:\w \$ "

RUN apk add --update --no-cache \
       subversion \
       apache2 \
       apache2-webdav \
       apache2-utils \
       mod_dav_svn \
       openjdk8-jre \
       ttf-dejavu \
       fontconfig \
       tzdata \
       tini \
    && fc-cache -f -v \
    && ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo "${TZ}" > /etc/timezone \
    && rm -rf /var/cache/apk/* /tmp/*

# 全局Apache原生超时配置
RUN echo -e "\n# SVN大文件传输全局超时配置" >> /etc/apache2/httpd.conf \
    && echo "Timeout 900" >> /etc/apache2/httpd.conf \
    && echo "KeepAlive On" >> /etc/apache2/httpd.conf \
    && echo "KeepAliveTimeout 60" >> /etc/apache2/httpd.conf \
    && echo "LimitRequestBody 0" >> /etc/apache2/httpd.conf

# 先清空原有文件，再逐行写入svn.conf，避免空文件
RUN rm -f /etc/apache2/conf.d/svn.conf \
    && echo "<Location /svn>" >> /etc/apache2/conf.d/svn.conf \
    && echo "    DAV svn" >> /etc/apache2/conf.d/svn.conf \
    && echo "    SVNParentPath /home/svnWebUI/repos" >> /etc/apache2/conf.d/svn.conf \
    && echo "    SVNListParentPath On" >> /etc/apache2/conf.d/svn.conf \
    && echo "    LimitRequestBody 0" >> /etc/apache2/conf.d/svn.conf \
    && echo "</Location>" >> /etc/apache2/conf.d/svn.conf

COPY target/svnWebUI-*.jar /home/svnWebUI.jar
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN ["chmod", "+x", "/usr/local/bin/entrypoint.sh"]
ENTRYPOINT ["tini", "entrypoint.sh"]