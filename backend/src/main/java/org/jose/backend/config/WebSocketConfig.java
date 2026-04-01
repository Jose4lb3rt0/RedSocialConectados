package org.jose.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    // @Lazy para romper la dependencia circular: WebSocketConfig → SimpMessagingTemplate → MessageBroker → WebSocketConfig
    @Autowired
    public void setSimpMessagingTemplate(@Lazy SimpMessagingTemplate template) {
        webSocketAuthInterceptor.setMessagingTemplate(template);
    }

    public WebSocketConfig(WebSocketAuthInterceptor webSocketAuthInterceptor) {
        this.webSocketAuthInterceptor = webSocketAuthInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        //WebSocketMessageBrokerConfigurer.super.configureMessageBroker(registry);
        //registry.enableSimpleBroker("/user", "/topic");
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //WebSocketMessageBrokerConfigurer.super.registerStompEndpoints(registry);
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        //WebSocketMessageBrokerConfigurer.super.configureClientInboundChannel(registration);
        registration.interceptors(webSocketAuthInterceptor);  // El interceptor valida el JWT en cada CONNECT y asocia el principal
    }
}
