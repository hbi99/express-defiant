<xsl:template name="books">
    <h1>Books</h1>
   
   <xsl:for-each select="//book">
        <p>
            <b><xsl:value-of select="title"/></b><br/>
            <xsl:value-of select="category"/>
        <p>
   </xsl:for-each>

</xsl:template>