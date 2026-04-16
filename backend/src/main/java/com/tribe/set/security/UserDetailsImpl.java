package com.tribe.set.security;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tribe.set.entity.User;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private String email;

    @JsonIgnore
    private String password;

    private String role;
    private String district;
    private String taluka;
    private String village;

    private GrantedAuthority authority;

    public UserDetailsImpl(String id, String name, String email, String password,
            String role, String district, String taluka, String village,
            GrantedAuthority authority) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.district = district;
        this.taluka = taluka;
        this.village = village;
        this.authority = authority;
    }

    public static UserDetailsImpl build(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new UserDetailsImpl(
                user.getUserID(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().name(),
                user.getDistrict(),
                user.getTaluka(),
                user.getVillage(),
                authority);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(authority);
    }

    public String getId() {
        return id;
    }

    public String getUserID() {
        return id;
    }
    
    public String getRole() {
        return role;
    }

    public String getDistrict() {
        return district;
    }

    public String getTaluka() {
        return taluka;
    }

    public String getVillage() {
        return village;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // We use email as username
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
